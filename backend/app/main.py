
import os
from fastapi.responses import JSONResponse
from fastapi import FastAPI
from fastapi import FastAPI
from fastapi import FastAPI, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, dotenv_values
import logging
from pathlib import Path
from math import ceil, log10
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
  
  result = []
  file_sizes = [
    "KB",
    "MB",
    "GB"
  ]
  
  for file_id in os.listdir(UPLOAD_DIR):
    
    path = os.path.join(UPLOAD_DIR, file_id)
    is_file = os.path.isfile(path)
    
    file_size_bytes = None
    shape = None
    
    if (is_file):
      file_size_bytes = os.path.getsize(path)
      
    else:
      zarr_data = zarr.open_group(path)
      store = zarr_data.store
      file_size_bytes = sum(store.getsize(k) for k in store.keys())
      
      shape = await get_dims_zarr(zarr_data["X"])
    
    ceil_log_size = ceil(log10(file_size_bytes) / 4)
    file_size = file_size_bytes * ((1/1024)**ceil_log_size)
    file_size_result = f"{file_size:.2f} {file_sizes[ceil_log_size-1]}"
    
    result.append({
      "name": file_id,
      # "shape": shape,
      "file_size": file_size_result
    })
    
  result.sort(key=lambda x: x["name"])
    
  return JSONResponse(content={
      "message": "Thesis API",
      "files": result
  })

# 
async def get_dims_zarr(data: any):
  if (isinstance(data, zarr.Group)):
    
    # result = csr_matrix((data["data"], data["indices"], data["indptr"]))
    # print("result?", result)
    
    return [int(data["indptr"].shape[0]-1), int(data["indices"][-1]+1)]
    return None
  else:
    return None

# READY
@app.get("/get_filenames")
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

# READY
@app.get("/get_file_size")
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
  
# READY
@app.get("/get_file_hierarchy")
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

# READY
@app.get("/get_file_obs")
async def get_file_obs(file_id: str, obs: str):
  
  time_start = time.time()
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  obj = "Something went wrong while fetching obs"
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' is not a valid.")
  
  if (file_path.endswith(".zarr")):
    obj = zu.get_zarr_file_obs(file_path, obs)
  
  elif (file_path.endswith(".h5ad")):
    obj = au.get_anndata_file_obs(file_path, obs)
    
  if (obj is None):
    return JSONResponse(content="Something went wrong.")
  
  time_end = time.time()
  
  time_elapsed = time_end - time_start

  return JSONResponse(content=json.dumps(obj))
  # return JSONResponse(content={
  #   "time": time_elapsed,
  #   "obs": json.dumps(obj),
  # })

# READY
@app.get("/get_file_obsm")
async def get_file_obsm(file_id: str, obsm: str):
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  obj = "Something went wrong while fetching obs"
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' is not a valid.")
  
  if (file_path.endswith(".zarr")):
    obj = zu.get_zarr_file_obsm(file_path, obsm)
  
  elif (file_path.endswith(".h5ad")):
    obj = au.get_anndata_file_obsm(file_path, obsm)
  
  if (obj is None):
    return JSONResponse(content="Something went wrong.")
  
  return JSONResponse(content=json.dumps(obj))

@app.post("/generate_umap/")
async def generate_umap(
  file_id: str = Form(...),
  adata_key: str = Form(...),
  n_pcs: int = Form(...),
  min_dist: float = Form(...),
  spread: float = Form(...),
  n_neighbors: int = Form(...),
):
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  obj = "Something went wrong while generating UMAP"
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' is not a valid.")
  
  elif (file_path.endswith(".h5ad")):
    obj = au.generate_umap_h5ad(file_path, adata_key, n_pcs, min_dist, spread, n_neighbors)
  
  return JSONResponse(content={
    "response": "File has been successfully updated." if (obj) else "Something went wrong.",
    "data": obj
  })

@app.post("/generate_leiden/")
async def generate_leiden(
  file_id: str = Form(...),
  uns_key: str = Form(...),
  resolution: float = Form(...),
):
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  obj = "Something went wrong while generating leiden"
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' is not a valid.")
  
  elif (file_path.endswith(".h5ad")):
    obj = au.generate_leiden_h5ad(file_path, uns_key, resolution)
  
  return JSONResponse(content={
    "response": "File has been successfully updated." if (obj) else "Something went wrong.",
    "data": obj
  })

@app.post("/generate_ranked_genes_groups/")
async def generate_ranked_genes_groups(
  file_id: str = Form(...),
  uns_key: str = Form(...),
):
  file_path = os.path.join(UPLOAD_DIR, file_id)
  obj = "Something went wrong while generating leiden"
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' is not a valid.")
  
  elif (file_path.endswith(".h5ad")):
    obj = au.generate_ranked_genes_groups(file_path, uns_key)
  
  return JSONResponse(content={
    "response": "File has been successfully updated." if (obj) else "Something went wrong.",
    "data": obj
  })

@app.get("/get_ranked_genes_groups")
async def get_ranked_genes_groups(
  file_id: str,
  # group_id: str
):
  file_path = os.path.join(UPLOAD_DIR, file_id)
  obj = "Something went wrong while generating leiden"
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' is not a valid.")
  
  elif (file_path.endswith(".h5ad")):
    obj = au.get_ranked_genes_groups(file_path)
  
  return JSONResponse(content=json.dumps(obj))

@app.get("/get_rgg_dotplot")
async def get_rgg_dotplot(
  file_id: str,
  uns_key: str,
  n_genes: int,
  # n_groups: int,
):
  file_path = os.path.join(UPLOAD_DIR, file_id)
  obj = "Something went wrong while generating leiden"
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' is not a valid.")
  
  elif (file_path.endswith(".h5ad")):
    obj = au.get_rgg_dotplot(file_path, uns_key, n_genes)
  
  return JSONResponse(content=json.dumps(obj))


@app.get("/get_genes")
async def get_genes(
  file_id: str
):
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  obj = "Something went wrong while generating leiden"
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' is not a valid.")
  
  if (file_path.endswith(".h5ad")):
    obj = au.get_genes_h5ad(file_path)
  
  return JSONResponse(content=obj)