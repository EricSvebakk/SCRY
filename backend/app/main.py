
import os
import logging
import celltypist as ct
import worker

from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Form, Header
from dotenv import load_dotenv, dotenv_values
from pathlib import Path
from typing import Optional, TypedDict, Callable
from celery.result import AsyncResult
from my_types import newObservation
import hashlib
from my_types import ValidationResponse

load_dotenv()
FRONTEND_ENDPOINT = os.environ.get("FRONTEND_ENDPOINT")
BACKEND_PATH = os.environ.get("BACKEND_PATH")
PASSKEY_SECRET = hashlib.sha256(os.environ.get("PASSKEY").encode("utf-8")).hexdigest()

FILEID = "file_id"
USERID = "user_id"
PASSKEY = "pass_key"

ORIGINS = [
    FRONTEND_ENDPOINT,
]
config = dotenv_values(".env")
app = FastAPI(root_path=BACKEND_PATH)

# print(config, ORIGINS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],        # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],        # Allow all headers
)

UPLOAD_DIR = "/persistent01"
ADATA_CHUNK_SIZE = 1000
UPLOAD_CHUNK_SIZE = 1024 * 1024 * 10 # 1MB chunks

logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.DEBUG)

# logger.debug(["config", ORIGINS])

# Creates directory if it does not exist
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)


def validate(user_id: str, pass_key: str, file_id: str, func: Callable, *args, delay: bool = False) -> ValidationResponse:
  
  if ((len(user_id) == 0) or (pass_key != PASSKEY_SECRET)):
    response: ValidationResponse = {
      "response": "Unauthorized Access",
      "ok": False,
      "code": 401,
    }
    return response
    
  file_path = os.path.join(UPLOAD_DIR, file_id)
  file_exists = os.path.exists(file_path)
  file_is_h5ad = file_path.endswith(".h5ad")
  
  file_ok = file_exists and file_is_h5ad
  
  if file_ok:
    print(func.__name__)
    
    if (delay):
      
      async_response = func.delay(file_path, user_id, *args)
      
      meta = worker.register_task_for_user(user_id, file_path, async_response.id, func.__name__, list(args))
      
      response: ValidationResponse = {
        "response": async_response.id,
        "timestamp": meta["created_at"],
        "ok": True,
        "code": 200
      }
    else:
      response = func(file_path, user_id, *args)
      
  else:
    if not file_exists:
      response = f"File ID '{file_id}' is not valid."
    elif not file_is_h5ad:
      response = f"File ID '{file_id}' is not an h5ad-file."
    else:
      response = "Problem unknown"
  
  return response

# ============================================================================================
# SYSTEM

@app.get("/", tags=["SYSTEM"])
async def root():
  """
  """
  return JSONResponse(content={ "message": "SCRY API" })

@app.get("/system/files", tags=["SYSTEM"])
async def system_file_names(
 user_id: str = Header(alias=USERID),
 pass_key: str = Header(alias=PASSKEY),
):
  """
  """
  
  if ((len(user_id) == 0) or (pass_key != PASSKEY_SECRET)):
    return JSONResponse(
      content={
        "response": "Unauthorized Access",
        "ok": False,
      },
      status_code=401
    )
  
  files = os.listdir(UPLOAD_DIR)
  files_h5ad = list(filter(lambda x: x.endswith("h5ad"), files))
  
  files_h5ad_sizes = []
  
  for file_id in files_h5ad:
    file_path = os.path.join(UPLOAD_DIR, file_id)
    
    try:
      file_size = os.stat(file_path, follow_symlinks=True).st_size
      files_h5ad_sizes.append(file_size)
    except FileNotFoundError:
      pass
  
  obj = {
    "response": {
      "files": files_h5ad,
      "h5ad_sizes": files_h5ad_sizes,
    },
    "ok": True
  }
  
  return JSONResponse(content=obj)

# ============================================================================================
# FILE

  
# ============================================================================================
# CELLTYPIST

@app.get("/celltypist/models", tags=["SYSTEM"])
async def celltypist_models():
  obj = {
    "response": ct.models.models_description().to_dict(orient="records"),
    "ok": True
  }
  return JSONResponse(content=obj)

# ============================================================================================
# CELERY
@app.get("/file/metadata", tags=["FILE"])
async def file_metadata(
 file_id: str = Header(alias=FILEID),
 user_id: str = Header(alias=USERID),
 pass_key: str = Header(alias=PASSKEY),
):
  obj = validate(user_id, pass_key, file_id, worker.get_metadata)
  return JSONResponse(content=obj, status_code=obj["code"])

@app.get("/file/hierarchy", tags=["FILE"])
async def file_hierarchy(
 file_id: str = Header(alias=FILEID),
 user_id: str = Header(alias=USERID),
 pass_key: str = Header(alias=PASSKEY),
):
  obj = validate(user_id, pass_key, file_id, worker.get_hierarchy)
  return JSONResponse(content=obj, status_code=obj["code"])

@app.get("/file/obs", tags=["FILE"])
async def file_obs(
  obs: str,
  file_id: str = Header(alias=FILEID),
  user_id: str = Header(alias=USERID),
  pass_key: str = Header(alias=PASSKEY),
):
  obj = validate(user_id, pass_key, file_id, worker.get_observation, obs)
  return JSONResponse(content=obj, status_code=obj["code"])

@app.get("/file/obsm", tags=["FILE"])
async def file_obsm(
  obsm: str,
  file_id: str = Header(alias=FILEID),
  user_id: str = Header(alias=USERID),
  pass_key: str = Header(alias=PASSKEY),
):
  obj = validate(user_id, pass_key, file_id, worker.get_obsm, obsm)
  return JSONResponse(content=obj, status_code=obj["code"])

@app.get("/file/genes", tags=["FILE"])
async def file_genes(
  file_id: str = Header(alias=FILEID),
  user_id: str = Header(alias=USERID),
  pass_key: str = Header(alias=PASSKEY),
):
  obj = validate(user_id, pass_key, file_id, worker.get_genes)
  return JSONResponse(content=obj, status_code=obj["code"])
  
@app.get("/file/feature", tags=["FILE"])
async def file_feature(
  feature_key: str,
  file_id: str = Header(alias=FILEID),
  user_id: str = Header(alias=USERID),
  pass_key: str = Header(alias=PASSKEY),
):
  obj = validate(user_id, pass_key, file_id, worker.get_feature_indices, feature_key)
  return JSONResponse(content=obj, status_code=obj["code"])

# @app.post("/file/ldr", tags=["FILE"])
# async def celery_file_ldr(
#   n_pcs: int = Form(...),
#   file_id: str = Header(alias=FILEID),
#   user_id: str = Header(alias=USERID),
#   pass_key: str = Header(alias=PASSKEY),
# ):
#   obj = validate(user_id, pass_key, file_id, worker.compute_ldr, n_pcs, delay=True)
#   return JSONResponse(content=obj, status_code=obj["code"])

@app.post("/compute/embedding", tags=["COMPUTE"])
async def compute_embedding(
  adata_key: str = Form(...),
  n_pcs: int = Form(...),
  min_dist: float = Form(...),
  spread: float = Form(...),
  n_neighbors: int = Form(...),
  file_id: str = Header(alias=FILEID),
  user_id: str = Header(alias=USERID),
  pass_key: str = Header(alias=PASSKEY),
):
  obj = validate(user_id, pass_key, file_id, worker.compute_nldr, adata_key, n_pcs, min_dist, spread, n_neighbors, delay=True)
  return JSONResponse(content=obj, status_code=obj["code"])

@app.post("/compute/leiden", tags=["COMPUTE"])
async def compute_leiden(
  uns_key: str = Form(...),
  neighbors_key: str = Form(...),
  resolution: float = Form(...),
  file_id: str = Header(alias=FILEID),
  user_id: str = Header(alias=USERID),
  pass_key: str = Header(alias=PASSKEY),
):
  obj = validate(user_id, pass_key, file_id, worker.compute_leiden, uns_key, neighbors_key, resolution, delay=True)
  return JSONResponse(content=obj, status_code=obj["code"])

@app.post("/compute/dge", tags=["COMPUTE"])
async def compute_dge(
  uns_key: str = Form(...),
  n_genes: int = Form(...),
  selected_genes: Optional[list[str]] = Form(None),
  file_id: str = Header(alias=FILEID),
  user_id: str = Header(alias=USERID),
  pass_key: str = Header(alias=PASSKEY),
):
  obj = validate(user_id, pass_key, file_id, worker.compute_rgg, uns_key, n_genes, selected_genes, delay=True)
  return JSONResponse(content=obj, status_code=obj["code"])

@app.post("/compute/copy", tags=["COMPUTE"])
async def compute_copy(
  new_file_id: str = Form(...),
  selected_obs: str = Form(...),
  selected_obs_clusters: list[str] = Form(...),
  file_id: str = Header(alias=FILEID),
  user_id: str = Header(alias=USERID),
  pass_key: str = Header(alias=PASSKEY),
):
  obj = validate(user_id, pass_key, file_id, worker.compute_save_file_as, new_file_id, selected_obs, selected_obs_clusters, delay=True)
  return JSONResponse(content=obj, status_code=obj["code"])

@app.post("/compute/recluster", tags=["COMPUTE"])
async def compute_recluster(
  observation: newObservation,
  file_id: str = Header(alias=FILEID),
  user_id: str = Header(alias=USERID),
  pass_key: str = Header(alias=PASSKEY),
):
  obj = validate(user_id, pass_key, file_id, worker.compute_recluster, observation.model_dump(), delay=True)
  return JSONResponse(content=obj, status_code=obj["code"])

@app.post("/compute/merge", tags=["COMPUTE"])
async def compute_merge(
  file_path_dest: str,
  observation: newObservation,
  file_id: str = Header(alias=FILEID),
  user_id: str = Header(alias=USERID),
  pass_key: str = Header(alias=PASSKEY),
):
  obj = validate(user_id, pass_key, file_id, worker.compute_recluster, file_path_dest, observation.model_dump(), delay=True)
  return JSONResponse(content=obj, status_code=obj["code"])

@app.post("/celltypist/annotate", tags=["COMPUTE"])
async def celltypist_annotate(
  annotation_key: str = Form(...),
  connectivities_key: str = Form(...),
  annotation_model: Optional[str] = Form(None),
  file_id: str = Header(alias=FILEID),
  user_id: str = Header(alias=USERID),
  pass_key: str = Header(alias=PASSKEY),
):
  obj = validate(user_id, pass_key, file_id, worker.compute_celltypist_annotations, annotation_key, connectivities_key, annotation_model, delay=True)
  return JSONResponse(content=obj, status_code=obj["code"])

# ============================================================================================
# STATUS

@app.get("/status/tasks", tags=["STATUS"])
async def celery_user_tasks(
  file_id: str = Header(alias=FILEID),
  user_id: str = Header(alias=USERID),
  pass_key: str = Header(alias=PASSKEY),
):
  obj = validate(user_id, pass_key, file_id, worker.get_tasks)
  return JSONResponse(content=obj, status_code=obj["code"])

@app.get("/status/task", tags=["STATUS"])
async def celery_status(
  task_id: str,
  user_id: str = Header(alias=USERID),
  pass_key: str = Header(alias=PASSKEY),
):
  
  obj = None
  
  if ((len(user_id) == 0) or (pass_key != PASSKEY_SECRET)):
    obj: ValidationResponse = {
      "response": "Unauthorized Access",
      "ok": False,
      "code": 401
    }
  
  else:
  
    result = AsyncResult(task_id)
  
    obj: ValidationResponse = {
      "response": {
        "task_id": task_id,
        "status": result.status,
        "progress": result.info if result.status not in ("SUCCESS") else "See /get_finished_task for results"
      },
      "ok": True,
      "code": 200,
    }
  
  return JSONResponse(content=obj)

@app.get("/status/result", tags=["STATUS"])
async def celery_result(
  task_id: str,
  user_id: str = Header(alias=USERID),
  pass_key: str = Header(alias=PASSKEY),
):
  
  obj = None
  
  if ((len(user_id) == 0) or (pass_key != PASSKEY_SECRET)):
    obj: ValidationResponse = {
      "response": "Unauthorized Access",
      "ok": False, 
      "code": 401
    }
    
  else:
  
    result = AsyncResult(task_id)
    
    if result.failed():
      
      obj: ValidationResponse = {
        "response": {
          "type": type(result.result).__name__,
          "message": str(result.result)
        },
        "ok": False,
        "code": 500
      }
      
    elif result.successful():
      obj: ValidationResponse = result.result
    
    else:
      obj: ValidationResponse = {
        "response": {
          "status": result.status,
          "message": "Task not finished yet"
        },
        "ok": True,
        "code": 200
      }
      
  return JSONResponse(content=obj)
