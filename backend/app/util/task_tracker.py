
import time
import json
import os
from anndata import AnnData
from celery import Task
from redis import Redis
from dataclasses import dataclass
from typing import Callable, Optional, TypedDict
from types import TracebackType
from util.context_manager import open_h5ad_write

# ============================================================================================

@dataclass
class TaskStep:
  """
  Represents a single step in a multi-step computation pipeline.

  Attributes
  ----------
  description : str
    Human-readable description of the step, used for progress reporting.
  func : Callable[[AnnData], bool]
    The function executed for this step. Operates on an AnnData object.
    Should return a boolean indicating whether the step modified the data.
  predicate : Optional[Callable[[AnnData], bool]]
    Optional condition used to determine whether the step should run.
    If None, the step always executes.
  """
  
  description: str
  func: Callable[[AnnData], bool]
  predicate: Optional[Callable[[AnnData], bool]] = None

class TaskMetadata(TypedDict):
  """
  Type definition for progress metadata stored and returned to the frontend.

  Attributes
  ----------
  current : int
    Index of the current pipeline step.
  total : int
    Total number of pipeline steps.
  message : str
    Short summary of what the task is currently doing.
  status : str
    Human-readable progress status, including step counts.
  """
  
  current: int
  total: int
  message: str
  status: str

# ============================================================================================

class StatusTracker:
  """
  Encapsulates all Redis-based status tracking and progress updates for a Celery task.

  This class:
    • registers the task at startup
    • updates progress during execution
    • stores metadata in Redis
    • removes the task from the user's active-task set when finished

  It is used internally by `TaskRunner` and not intended to be instantiated externally.
  """
  
  @staticmethod
  def user_task_key(user_id: str) -> str:
    """Return the Redis key for storing active tasks for a given user."""
    
    return f"user_task:{user_id}"
  
  @staticmethod
  def task_meta_key(task_id: str) -> str:
    """Return the Redis key where metadata for a specific task is stored."""
    
    return f"task_meta:{task_id}"
  
  def __init__(self, user_id: str, r: Redis, task: Task):
    """
    Initialize a new StatusTracker.

    Parameters
    ----------
    user_id : str
      User performing the operation; determines where the task is listed.
    r : Redis
      Redis client used to store task metadata and indexing.
    task : Task
      The Celery task object whose progress is tracked.
    """
    
    self.user_id = user_id
    self.r: Redis = r
    self.task: Task = task
    self.ttl_default = 7 * 24 * 3600

  
  def _task_id(self) -> str:
    """Return the Celery task ID for the currently running task."""
    
    return self.task.request.id


  def register_task(self, file_path: str, func_name: str, args: list, meta: TaskMetadata):
    """
    Register the task in Redis before the first pipeline step begins.
  
    Parameters
    ----------
    file_path : str
        Path to the AnnData file being processed.
    func_name : str
        Name of the Celery task function.
    args : list
        Arguments passed to the function (stored for inspection/debugging).
    meta : TaskMetadata
        Initial progress metadata.
    """
    
    # Side Effects:
    # • Adds the task ID to the user's active-task set.
    # • Creates or replaces the metadata hash for the task.
    # • Sets initial Celery progress state.
    
    key_user = StatusTracker.user_task_key(self.user_id)
    key_meta = StatusTracker.task_meta_key(self._task_id())

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
    """
    Update the task's progress metadata during execution.

    Side Effects:
      • Writes updated progress JSON into the Redis metadata hash.
      • Refreshes TTL.
      • Updates Celery's internal task state.

    Parameters
    ----------
    state : str
      Current state.
    meta : TaskMetadata
      Updated progress metadata.
    """
    
    
    key = StatusTracker.task_meta_key(self._task_id())
    mapping = {
      "status": state,
      "updated_at": str(int(time.time()) * 1000),
      "progress_meta": json.dumps(meta),
    }

    self.r.hset(key, mapping=mapping)
    self.r.expire(key, self.ttl_default)
    self.task.update_state(state="PROGRESS", meta=meta)

  def finish(self, state: str, meta: TaskMetadata, error: str | None = None):
    """
    Finalize a task after its pipeline completes or fails.

    Side Effects:
      • Updates task metadata to reflect the final state.
      • Removes the task ID from the user's active-task set.
      • Keeps metadata available in Redis for up to TTL.

    Parameters
    ----------
    state : str
      Final state.
    meta : TaskMetadata
      Final metadata summary presented to the user.
    error : str, optional
      Error message truncated and stored if task failed.
    """
    
    key_task = StatusTracker.task_meta_key(self._task_id())
    key_user = StatusTracker.user_task_key(self.user_id)

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
  """
  High-level execution wrapper for Redis-based status tracking and Celery tasks that process AnnData objects.

  This class:
    • opens the AnnData file using a context manager
    • delegates status tracking to StatusTracker
    • executes a sequence of TaskSteps
    • records whether any modification occurred
    • writes updated AnnData only once at the end

  """
  
  def __init__(
    self,
    r: Redis,
    task: Task,
    file_path: str,
    user_id: str,
    func_name: str,
    func_args: list,
  ):
    """
    Construct a new TaskRunner.

    Parameters
    ----------
    r : Redis
      Redis client for storing progress metadata.
    task : Task
      Celery task instance to update state for.
    file_path : str
      Path to the AnnData file being processed.
    user_id : str
      Identifier of the user who triggered the computation.
    func_name : str
      Name of the Celery function being executed (used for metadata).
    func_args : list
      Arguments passed to the computation function.
    
    Usage
    -----
    ```
    runner = TaskRunner(r, task, file_path, user_id, func_name, args)
    
    runner.add_step(...)
    runner.add_step(...)
    
    with runner as job:
      job.run_steps()
      
      if job.changes_made:
        sc.write(file_path, job.adata)
    ```
    
    """
    
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
    """
    Initialize status tracking and register the task before pipeline execution begins.
    """
    
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
    """
    Finalize the tracked task after execution finishes.

    Parameters
    ----------
    state : str
      Final status ("SUCCESS" or "FAILURE").
    error : str, optional
      Error message if the task failed.
    """
    
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
    """
    Update progress metadata for a given pipeline step.
    
    Parameters
    ----------
    step_index : int
      Index of the current pipeline step.
    steps : list[str]
      List of step descriptions.
    """
    
    if self._status_tracker is None:
      return

    num_steps = len(steps)
    if 0 <= step_index < num_steps:
      meta: TaskMetadata = {
        "current": step_index + 1,
        "total": num_steps,
        "message": steps[step_index],
        "status": f"Step {step_index + 1}/{num_steps}: {steps[step_index]}",
      }
      self._status_tracker.set_status("PROGRESS", meta)

  # --- context manager interface ----------------------------------------
  
  def __enter__(self) -> "TaskRunner":
    """
    Enter the execution context manager.
    This will open the AnnData file for writing,
    initialize status tracking, and prepare the internal state.

    Returns
    -------
    TaskRunner
      The runner instance containing the open AnnData object.
    """
    
    self._start_tracker()
    self._context_manager = open_h5ad_write(self.r, self.file_path, self.user_id)
    self.adata = self._context_manager.__enter__()
    return self

  def __exit__(
    self,
    exception_type: type[BaseException] | None,
    exception_value: BaseException | None,
    traceback: TracebackType | None,
  ):
    """
    Exit the execution context manager.
    This will finalize progress tracking with SUCCESS or FAILURE,
    and close the AnnData file context manager.
    """
    
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
    """
    Add a pipeline step to the computation.

    Parameters
    ----------
    description : str
      Human-readable description used in progress metadata.
    func : Callable[[AnnData], bool]
      Function implementing the step logic. Mutates AnnData and returns True if changed.
    predicate : Callable[[AnnData], bool], optional
      Condition that determines whether the step should run.

    Returns
    -------
    TaskRunner
      The runner instance for call chaining.
    """
    
    self.task_steps.append(TaskStep(
      description=description,
      func=func,
      predicate=predicate
    ))
    
    return self

  def run_steps(self):
    """
    Execute the pipeline of steps in order.

    This method:
      • updates progress metadata before each step
      • checks predicates to determine whether steps should run
      • records whether any step changed the AnnData object

    Raises
    ------
    RuntimeError
      If called before entering the context and opening the AnnData object.
    """
    
    if self.adata is None:
      raise RuntimeError("TaskRunner must be used as a context manager before run_steps().")

    descriptions = [step.description for step in self.task_steps]

    for index, step in enumerate(self.task_steps):
      self._update_tracker(index, descriptions)
      
      # Determine if step.func() needs to be run
      is_runnable = step.predicate(self.adata) if step.predicate else True

      if not is_runnable:
        continue
      
      # Run step
      step.func(self.adata)
      
      # If predicate says the data was missing, assume this step changed it
      if step.predicate:
        self.changes_made = True
