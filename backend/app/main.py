
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Form
from dotenv import load_dotenv, dotenv_values
from pathlib import Path
from math import ceil, log10
from typing import Optional
import celltypist as ct
import scanpy as sc

from celery.result import AsyncResult
from worker import compute_rgg_dotplot, compute_nldr, compute_ldr, compute_clustering, compute_celltypist_annotations, compute_save_file_as

import os
import logging
import zarr
import json
import time

import zarr_util as zu
import anndata_util as au


load_dotenv()
FRONTEND_ENDPOINT = os.environ.get("FRONTEND_ENDPOINT")
ORIGINS = [
    "https://thesis.tepohi.no",
    "https://www.thesis.tepohi.no",
    FRONTEND_ENDPOINT,
]
config = dotenv_values(".env")
app = FastAPI()

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

# 
@app.get("/")
async def root():
  """
  """
    
  return JSONResponse(content={ "message": "Thesis API" })

# ============================================================================================
@app.get("/get_filenames", tags=["SYSTEM"])
async def get_filenames():
  """
  """
  
  files = os.listdir(UPLOAD_DIR)
  files_h5ad = list(filter(lambda x: x.endswith("h5ad"), files))
  
  files_h5ad_sizes = []
  
  for file_id in files_h5ad:
    files_h5ad_sizes.append(os.path.getsize(os.path.join(UPLOAD_DIR, file_id)))
  
  return JSONResponse(
    content={
      "files": files,
      "h5ad": files_h5ad,
      "h5ad_sizes": files_h5ad_sizes,
      "zarr": list(filter(lambda x: x.endswith("zarr"), files)),
    }
  )

@app.get("/get_file_size", tags=["SYSTEM"])
async def get_file_size(file_id: str):
  """
  """
  
  file_size = os.path.getsize(f"{UPLOAD_DIR}/{file_id}")
  
  return JSONResponse(
    content={
      "file_size": file_size,
      "chunk_total": ceil(file_size / UPLOAD_CHUNK_SIZE),
    }
  )

@app.get("/get_file_hierarchy", tags=["SYSTEM"])
async def get_file_hierarchy(file_id: str):
  """
  """

  file_path = os.path.join(UPLOAD_DIR, file_id)
  obj = "Please provide a valid file-type (h5ad, zarr)"
  
  if (file_path.endswith(".zarr")):
    obj = zu.get_zarr_file_hierarchy(file_path)
  elif (file_path.endswith(".h5ad")):
    obj = au.get_anndata_file_hierarchy(file_path)
  
  return JSONResponse(content=obj)

# ============================================================================================
@app.get("/get_file_obs", tags=["ANNDATA"])
async def get_file_obs(file_id: str, obs: str):
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  obj = "Something went wrong while fetching obs"
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' does not exist.")
  
  if (file_path.endswith(".zarr")):
    obj = zu.get_zarr_file_obs(file_path, obs)
  
  elif (file_path.endswith(".h5ad")):
    obj = au.get_anndata_file_obs(file_path, obs)
    
  if (obj is None):
    return JSONResponse(content="Something went wrong.")

  return JSONResponse(content=json.dumps(obj))

@app.get("/get_file_obsm", tags=["ANNDATA"])
async def get_file_obsm(file_id: str, obsm: str):
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  obj = "Something went wrong while fetching obs"
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' does not exist.")
  
  if (file_path.endswith(".zarr")):
    obj = zu.get_zarr_file_obsm(file_path, obsm)
  
  elif (file_path.endswith(".h5ad")):
    obj = au.get_anndata_file_obsm(file_path, obsm)
  
  if (obj is None):
    return JSONResponse(content="Something went wrong.")
  
  return JSONResponse(content=json.dumps(obj))

@app.get("/get_genes", tags=["ANNDATA"])
async def get_genes(
  file_id: str
):
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  obj = "Something went wrong while generating leiden"
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' does not exist.")
  
  if (file_path.endswith(".h5ad")):
    obj = au.get_genes_h5ad(file_path)
  
  return JSONResponse(content=obj)

@app.get("/get_feature_coordinates", tags=["ANNDATA"])
async def get_feature_coordinates(
  file_id: str,
  feature_key: str,
):
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  obj = "Something went wrong while generating leiden"
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' does not exist.")
  
  if (not file_path.endswith(".h5ad")):
    return JSONResponse(content=f"File ID '{file_id}' is not an h5ad-file.")
  
  obj = au.get_anndata_feature_indices(file_path, feature_key)
  
  return JSONResponse(content=obj)
  

# ============================================================================================
@app.get("/get_model_types", tags=["CELLTYPIST"])
async def get_model_types():
  
  models = ct.models.models_description().to_dict(orient="records")
  
  return JSONResponse(content={
    "models": models
  })

# ============================================================================================
@app.post("/start_task_compute_ldr/", tags=["WORKFLOW"])
async def start_task_compute_ldr(
  file_id: str = Form(...),
  n_pcs: int = Form(...),
):
    
  file_path = os.path.join(UPLOAD_DIR, file_id)
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' is not valid.")
  
  if (not file_path.endswith(".h5ad")):
    return JSONResponse(content=f"File ID '{file_id}' is not an h5ad-file.")
  
  task = compute_ldr.delay(file_path, n_pcs)
  
  return JSONResponse(content={
    "task_id": task.id
  })

@app.post("/start_task_compute_nldr/", tags=["WORKFLOW"])
async def start_task_compute_nldr(
  file_id: str = Form(...),
  adata_key: str = Form(...),
  n_pcs: int = Form(...),
  min_dist: float = Form(...),
  spread: float = Form(...),
  n_neighbors: int = Form(...),
):
    
  file_path = os.path.join(UPLOAD_DIR, file_id)
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' is not valid.")
  
  if (not file_path.endswith(".h5ad")):
    return JSONResponse(content=f"File ID '{file_id}' is not an h5ad-file.")
  
  task = compute_nldr.delay(file_path, adata_key, n_pcs, min_dist, spread, n_neighbors)
  
  return JSONResponse(content={
    "task_id": task.id
  })

@app.post("/start_task_compute_clustering/", tags=["WORKFLOW"])
async def start_task_compute_clustering(
  file_id: str = Form(...),
  uns_key: str = Form(...),
  resolution: float = Form(...),
):
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' is not valid.")
  
  if (not file_path.endswith(".h5ad")):
    return JSONResponse(content=f"File ID '{file_id}' is not an h5ad-file.")
  
  task = compute_clustering.delay(file_path, uns_key, resolution)
  
  return JSONResponse(content={
    "task_id": task.id
  })

@app.post("/start_task_compute_rgg_dotplot/", tags=["WORKFLOW"])
async def start_task_compute_rgg_dotplot(
  file_id: str = Form(...),
  uns_key: str = Form(...),
  n_genes: int = Form(...),
  selected_genes: Optional[list[str]] = Form(None),
):
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' is not valid.")
  
  if (not file_path.endswith(".h5ad")):
    return JSONResponse(content=f"File ID '{file_id}' is not an h5ad-file.")
  
  print(uns_key, n_genes, selected_genes)
  
  task = compute_rgg_dotplot.delay(file_path, uns_key, n_genes, selected_genes)
  
  return JSONResponse(content={
    "task_id": task.id
  })

@app.post("/start_task_compute_celltypist_annotations/", tags=["WORKFLOW"])
async def start_task_compute_celltypist_annotations(
  file_id: str = Form(...),
  annotation_key: str = Form(...),
  connectivities_key: str = Form(...),
  annotation_model: Optional[str] = Form(None),
):
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' is not valid.")
  
  if (not file_path.endswith(".h5ad")):
    return JSONResponse(content=f"File ID '{file_id}' is not an h5ad-file.")
  
  task = compute_celltypist_annotations.delay(file_path, annotation_key, connectivities_key, annotation_model)
  
  return JSONResponse(content={
    "task_id": task.id
  })
  
@app.post("/start_task_compute_save_file_as/", tags=["WORKFLOW"])
async def start_task_compute_save_file_as(
  file_id: str = Form(...),
  new_file_id: str = Form(...),
  selected_obs: str = Form(...),
  selected_obs_clusters: list[str] = Form(...),
):
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  new_file_path = os.path.join(UPLOAD_DIR, new_file_id)
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' is not valid.")
  
  if (not file_path.endswith(".h5ad")):
    return JSONResponse(content=f"File ID '{file_id}' is not an h5ad-file.")
  
  task = compute_save_file_as.delay(file_path, new_file_path, selected_obs, selected_obs_clusters)
  
  return JSONResponse(content={
    "task_id": task.id
  })
  

# ============================================================================================
@app.get("/get_status_task", tags=["STATUS"])
async def get_status_task(
  task_id: str
):
  result = AsyncResult(task_id)
  
  return JSONResponse(content={
    "task_id": task_id,
    "status": result.status,
    "progress": result.info if result.status not in ("SUCCESS") else "See /get_finished_task for results"
  })

@app.get("/get_finished_task", tags=["STATUS"])
async def get_finished_task(
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