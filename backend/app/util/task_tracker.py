import time
import json
import os

from anndata import AnnData
from celery import Task
from redis import Redis
from dataclasses import dataclass
from typing import Callable, Optional, TypedDict
from types import TracebackType

from context_manager import open_h5ad_write

# ============================================================================================

@dataclass
class TaskStep:
  description: str
  func: Callable[[AnnData], bool]
  predicate: Optional[Callable[[AnnData], bool]] = None

class TaskMetadata(TypedDict):
  current: int
  total: int
  message: str
  status: str

# ============================================================================================

class StatusTracker:
  def __init__(self, user_id: str, r: Redis, task: Task):
    self.user_id = user_id
    self.r: Redis = r
    self.task: Task = task
    self.ttl_default = 7 * 24 * 3600

  def _task_id(self) -> str:
    return self.task.request.id

  def _task_meta_key(self) -> str:
    return f"task_meta:{self._task_id()}"

  def _user_task_key(self) -> str:
    return f"user_task:{self.user_id}"

  def register_task(self, file_path: str, func_name: str, args: list, meta: TaskMetadata):
    key_user = self._user_task_key()
    key_meta = self._task_meta_key()

    now = int(time.time()) * 1000

    mapping = {
      "status": "PENDING",
      "user_id": self.user_id,
      "file_id": os.path.basename(file_path),
      "task_id": self._task_id(),
      "task_name": func_name,
      "created_at": str(now),
      "func": func_name,
      "args_json": json.dumps(args),
    }

    pipe = self.r.pipeline()
    pipe.sadd(key_user, self._task_id())
    pipe.hset(key_meta, mapping=mapping)
    pipe.expire(key_meta, self.ttl_default)
    pipe.execute()

    # initial progress
    self.task.update_state(state="PROGRESS", meta=meta)

  def set_status(self, state: str, meta: TaskMetadata):
    key = self._task_meta_key()
    mapping = {
      "status": state,
      "updated_at": str(int(time.time()) * 1000),
      "progress_meta": json.dumps(meta),
    }

    self.r.hset(key, mapping=mapping)
    self.r.expire(key, self.ttl_default)
    self.task.update_state(state="PROGRESS", meta=meta)

  def finish(self, state: str, meta: TaskMetadata, error: str | None = None):
    key_task = self._task_meta_key()
    key_user = self._user_task_key()

    mapping: dict[str, str] = {
      "status": state,
      "finished_at": str(int(time.time()) * 1000),
    }

    if error:
      mapping["error"] = error[:1000]

    pipe = self.r.pipeline()
    pipe.hset(key_task, mapping=mapping)
    pipe.expire(key_task, self.ttl_default)
    pipe.srem(key_user, self._task_id())
    pipe.execute()

    self.task.update_state(state="PROGRESS", meta=meta)

# ============================================================================================

class TaskRunner:
  def __init__(
    self,
    r: Redis,
    task: Task,
    file_path: str,
    user_id: str,
    func_name: str,
    func_args: list,
  ):
    self.r: Redis = r
    self.task: Task = task

    self.file_path: str = file_path
    self.user_id: str = user_id
    self.func_name: str = func_name
    self.func_args: list = func_args

    self.adata: AnnData | None = None
    self.task_steps: list[TaskStep] = []
    self.changes_made: bool = False

    self._context_manager = None
    self._status_tracker: StatusTracker | None = None
    self._step_current = 0
    self._step_total = 0

  # --- internal helpers -------------------------------------------------
  
  def _start_tracker(self):
    self._status_tracker = StatusTracker(self.user_id, self.r, self.task)
    self._step_total = len(self.task_steps)

    current_message = "Opening AnnData object"
    meta: TaskMetadata = {
      "current": 0,
      "total": self._step_total,
      "message": current_message,
      "status": f"Step 0/{self._step_total}: {current_message}",
    }

    self._status_tracker.register_task(
      self.file_path,
      self.func_name,
      self.func_args,
      meta,
    )

  def _stop_tracker(self, state: str, error: str | None = None):
    if self._status_tracker is None:
      return

    current_message = "Writing new data to AnnData object"
    meta: TaskMetadata = {
      "current": self._step_total,
      "total": self._step_total,
      "message": current_message,
      "status": f"Step {self._step_total}/{self._step_total}: {current_message}",
    }

    self._status_tracker.finish(state, meta, error=error)

  def _update_tracker(self, step_index: int, steps: list[str]):
    if self._status_tracker is None:
      return

    num_steps = len(steps)
    if 0 <= step_index < num_steps:
      meta: TaskMetadata = {
        "current": step_index + 1,
        "total": num_steps,
        "message": steps[step_index],
        "status": f"Step {step_index + 1}/{num_steps if num_steps != 1 else 'X'}: {steps[step_index]}",
      }
      self._status_tracker.set_status("PROGRESS", meta)

  # --- context manager interface ----------------------------------------
  
  def __enter__(self) -> "TaskRunner":
    self._context_manager = open_h5ad_write(self.r, self.file_path, self.user_id)
    self.adata = self._context_manager.__enter__()
    self._start_tracker()
    return self

  def __exit__(
    self,
    exception_type: type[BaseException] | None,
    exception_value: BaseException | None,
    traceback: TracebackType | None,
  ):
    if exception_value is None:
      self._stop_tracker("SUCCESS")
    else:
      self._stop_tracker("FAILURE", error=str(exception_value))

    if self._context_manager is not None:
      self._context_manager.__exit__(exception_type, exception_value, traceback)

  # --- public API --------------------------------------------------------
  
  def add_step(
    self,
    description: str,
    func: Callable[[AnnData], bool],
    predicate: Optional[Callable[[AnnData], bool]] = None
  ) -> "TaskRunner":
    
    self.task_steps.append(TaskStep(
      description=description,
      func=func,
      predicate=predicate
    ))
    
    return self

  def run_steps(self):
    
    if self.adata is None:
      raise RuntimeError("TaskRunner must be used as a context manager before run_steps().")

    descriptions = [step.description for step in self.task_steps]

    for index, step in enumerate(self.task_steps):
      self._update_tracker(index, descriptions)

      if step.predicate is not None and not step.predicate(self.adata):
        continue

      self.changes_made = self.changes_made or bool(step.func(self.adata))
