
import os
import logging
import celltypist as ct
import worker

from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Form
from dotenv import load_dotenv, dotenv_values
from pathlib import Path
from typing import Optional, TypedDict, Callable
from celery.result import AsyncResult
from my_types import newObservation


load_dotenv()
FRONTEND_ENDPOINT = os.environ.get("FRONTEND_ENDPOINT")
BACKEND_PATH = os.environ.get("BACKEND_PATH")

ORIGINS = [
    FRONTEND_ENDPOINT,
]
config = dotenv_values(".env")
app = FastAPI(root_path=BACKEND_PATH)

print(config, ORIGINS)

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

logger.debug(["config", ORIGINS])

# Creates directory if it does not exist
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

class ValidationResponse(TypedDict):
  response: str
  ok: bool

def validate(file_id: str, func: Callable, *args, delay: bool = False) -> ValidationResponse:
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  file_exists = os.path.exists(file_path)
  file_is_h5ad = file_path.endswith(".h5ad")
  
  file_ok = file_exists and file_is_h5ad
  
  if file_ok:
    print(func.__name__)
    
    if (delay):
      response: ValidationResponse = {
        "response": func.delay(file_path, *args).id,
        "ok": True
      }
    else:
      response = func(file_path, *args)
      
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
  return JSONResponse(content={ "message": "Thesis API" })

@app.get("/system/files", tags=["SYSTEM"])
async def system_file_names():
  """
  """
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

@app.get("/celltypist/models", tags=["CELLTYPIST"])
async def celltypist_models():
  obj = {
    "response": ct.models.models_description().to_dict(orient="records"),
    "ok": True
  }
  return JSONResponse(content=obj)
  
# ============================================================================================
# CELERY

@app.get("/file/hierarchy", tags=["FILE"])
async def file_hierarchy(file_id: str, user_id: str):
  obj = validate(file_id, worker.get_hierarchy, user_id)
  return JSONResponse(content=obj)

@app.get("/file/obs", tags=["FILE"])
async def file_obs(file_id: str, user_id: str, obs: str):
  obj = validate(file_id, worker.get_observation, user_id, obs)
  return JSONResponse(content=obj)

@app.get("/file/obsm", tags=["FILE"])
async def file_obsm(file_id: str, user_id: str, obsm: str):
  obj = validate(file_id, worker.get_obsm, user_id, obsm)
  return JSONResponse(content=obj)

@app.get("/file/genes", tags=["FILE"])
async def file_genes(file_id: str, user_id: str):
  obj = validate(file_id, worker.get_genes, user_id)
  return JSONResponse(content=obj)
  
@app.get("/file/feature/coordinates", tags=["FILE"])
async def file_feature_coordinates(file_id: str, user_id: str, feature_key: str):
  obj = validate(file_id, worker.get_feature_indices, user_id, feature_key)
  return JSONResponse(content=obj)

@app.post("/file/ldr", tags=["FILE"])
async def celery_file_ldr(
  file_id: str = Form(...),
  user_id: str = Form(...),
  n_pcs: int = Form(...),
):
  obj = validate(file_id, worker.compute_ldr, user_id, n_pcs, delay=True)
  return JSONResponse(content=obj)

@app.post("/file/nldr", tags=["FILE"])
async def celery_file_nldr(
  file_id: str = Form(...),
  user_id: str = Form(...),
  adata_key: str = Form(...),
  n_pcs: int = Form(...),
  min_dist: float = Form(...),
  spread: float = Form(...),
  n_neighbors: int = Form(...),
):
  obj = validate(file_id, worker.compute_nldr, user_id, adata_key, n_pcs, min_dist, spread, n_neighbors, delay=True)
  return JSONResponse(content=obj)

@app.post("/file/leiden", tags=["FILE"])
async def celery_file_leiden(
  file_id: str = Form(...),
  user_id: str = Form(...),
  uns_key: str = Form(...),
  resolution: float = Form(...),
):
  obj = validate(file_id, worker.compute_leiden, user_id, uns_key, resolution, delay=True)
  return JSONResponse(content=obj)

@app.post("/file/rgg", tags=["FILE"])
async def celery_file_rgg(
  file_id: str = Form(...),
  user_id: str = Form(...),
  uns_key: str = Form(...),
  n_genes: int = Form(...),
  selected_genes: Optional[list[str]] = Form(None),
):
  obj = validate(file_id, worker.compute_rgg, user_id, uns_key, n_genes, selected_genes, delay=True)
  return JSONResponse(content=obj)

@app.post("/file/copy", tags=["FILE"])
async def celery_file_copy(
  file_id: str = Form(...),
  user_id: str = Form(...),
  new_file_id: str = Form(...),
  selected_obs: str = Form(...),
  selected_obs_clusters: list[str] = Form(...),
):
  obj = validate(file_id, worker.compute_save_file_as, user_id, new_file_id, selected_obs, selected_obs_clusters, delay=True)
  return JSONResponse(content=obj)

@app.post("/file/recluster", tags=["FILE"])
async def celery_file_recluster(
  file_id: str,
  user_id: str,
  observation: newObservation
):
  obj = validate(file_id, worker.compute_recluster, user_id, observation, delay=True)
  return JSONResponse(content=obj)

@app.post("/celltypist/annotate", tags=["CELLTYPIST"])
async def celery_celltypist_annotate(
  file_id: str = Form(...),
  annotation_key: str = Form(...),
  connectivities_key: str = Form(...),
  annotation_model: Optional[str] = Form(None),
):
  # obj = validate(file_id, worker.compute_celltypist_annotations, annotation_key, connectivities_key, annotation_model, delay=True)
  # return JSONResponse(content=obj)
  return JSONResponse(content={
    "message": "fuuuuuuuuuuck"
  }, status_code=500)

# ============================================================================================
# STATUS

@app.get("/celery/status", tags=["STATUS"])
async def celery_status(
  task_id: str
):
  result = AsyncResult(task_id)
  
  return JSONResponse(content={
    "task_id": task_id,
    "status": result.status,
    "progress": result.info if result.status not in ("SUCCESS") else "See /get_finished_task for results"
  })

@app.get("/celery/result", tags=["STATUS"])
async def celery_result(
  task_id: str
):
  result = AsyncResult(task_id)

  if result.successful():
    return result.result
  elif result.failed():
    return {
      "error": {
        "type": type(result.result).__name__,
        "message": str(result.result)
      }
    }
  else:
    return {
      "status": result.status,
      "message": "Task not finished yet"
    }
