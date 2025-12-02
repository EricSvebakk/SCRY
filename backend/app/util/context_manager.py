
from contextlib import contextmanager
from fastapi import HTTPException
import scanpy as sc
import os
import time
from redis import Redis
from redis.exceptions import LockError


@contextmanager
def _file_lock(r: Redis, file_path: str, user_id: str, timeout: int = 600, blocking: bool = True, blocking_timeout: float | None = None):
  lock_key = f"filelock:{file_path}"
  meta_key = f"{lock_key}:meta"

  lock = r.lock(lock_key, timeout=timeout)
  is_locked = lock.acquire(blocking=blocking, blocking_timeout=blocking_timeout)

  if not is_locked:
    current_user = r.hget(meta_key, "user_id")
    raise HTTPException(
      status_code=423,
      detail=f"File '{os.path.basename(file_path)}' is already locked by {current_user.decode() if current_user else 'unknown'}",
    )

  r.hset(meta_key, mapping={"user_id": user_id, "started_at": str(int(time.time()) * 1000)})

  try:
    yield
  finally:
    if is_locked:
      try:
        lock.release()
      except LockError:
        pass
      r.delete(meta_key)

@contextmanager
def open_h5ad_read(r: Redis, file_path: str, user_id: str, timeout: int = 600):
  
  with _file_lock(r, file_path, user_id, timeout=timeout, blocking=True, blocking_timeout=timeout):
  
    adata = None
    
    try:
      adata = sc.read_h5ad(file_path, backed="r")
      yield adata
      
    except Exception as e:
      print(f"Something unexpected happened while opening the file: {e}")
      raise
    
    finally:
      if adata is not None and getattr(adata, "file", None) is not None:
        adata.file.close()

@contextmanager
def open_h5ad_write(r: Redis, file_path: str, user_id: str, timeout: int = 600):
  
  with _file_lock(r, file_path, user_id, timeout=timeout, blocking=True):
    
    adata = None  # backed=None by default
    
    try:
      adata = sc.read_h5ad(file_path)
      yield adata
      
    except Exception as e:
      print(f"Something unexpected happened while opening the file: {e}")
      raise
      
    finally:
      pass