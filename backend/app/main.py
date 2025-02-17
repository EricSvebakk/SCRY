
import os
import dask.array
from fastapi.responses import JSONResponse
from fastapi import FastAPI, UploadFile, File, Form
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, dotenv_values
import logging
from pathlib import Path
import anndata as ad
from math import ceil, log10
import dask.array
import zarr
import json
import time

load_dotenv()
FRONTEND_ENDPOINT = os.environ.get("FRONTEND_ENDPOINT")
ORIGINS = [
    "https://tepohi.no",
    "https://www.tepohi.no",
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

adata = None

UPLOAD_DIR = "/persistent01"
ADATA_CHUNK_SIZE = 1000
UPLOAD_CHUNK_SIZE = 1024 * 1024 * 10 # 1MB chunks

logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.DEBUG)

logger.debug(["config", ORIGINS])

# Creates directory if it does not exist
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)


@app.get("/")
async def root():
  
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
    
    if (is_file):
      file_size_bytes = os.path.getsize(path)
    else:
      zarr_data = zarr.open_group(path)
      store = zarr_data.store
      file_size_bytes = sum(store.getsize(k) for k in store.keys())
    
    ceil_log_size = ceil(log10(file_size_bytes) / 4)
    file_size = file_size_bytes * ((1/1024)**ceil_log_size)
    file_size_result = f"{file_size:.2f} {file_sizes[ceil_log_size-1]}"
    
    result.append({
      "name": file_id,
      "file_size": file_size_result
    })
    
  return JSONResponse(content={
      "message": "Thesis API",
      "files": result
  })


@app.get("/get_filenames")
async def get_filenames():
  return JSONResponse(
    content={
      # "files": list(filter(lambda x: x.endswith("zarr"), os.listdir(UPLOAD_DIR)))
      "files": list(filter(lambda x: x.endswith("zarr"), os.listdir(UPLOAD_DIR)))
    }
  )


@app.get("/get_file_size")
async def get_file_size(file_id: str):
  filesize = os.path.getsize(f"{UPLOAD_DIR}/{file_id}")
  
  # logger.info(["HELLO", filesize])
  
  return JSONResponse(
    content={
      "file_size": filesize,
      "chunk_total": ceil(filesize / UPLOAD_CHUNK_SIZE),
    }
  )
  

@app.get("/get_file_hierarchy")
async def get_file_hierarchy(file_id: str):

  file_path = os.path.join(UPLOAD_DIR, file_id)

  print(file_path)

  zarr_data = zarr.open(file_path, "r")
  
  # print(zarr_data.tree())
  # print(zarr_data.shape())

  zarr_obj = {
      group_key: list(
          zarr_data[group_key].keys()
          if isinstance(zarr_data[group_key], zarr.Group)
          else []
      )
      for group_key in zarr_data.keys()
  }
  
  zarr_obj["obs"] = list(filter(lambda x: isinstance(zarr_data.obs[x], zarr.Group), zarr_data.obs.keys()))

  return JSONResponse(content=zarr_obj)


@app.get("/get_file_obs")
async def get_file_obs(file_id: str, obs: str):
  
  obs_path = os.path.join(UPLOAD_DIR, file_id, "obs", obs)
  obs_path_exists = os.path.exists(obs_path)
  obs_dir_exists = os.path.isdir(obs_path)
  
  # for obs
  if (not obs_path_exists or not obs_dir_exists):
    return JSONResponse(content={
        "message": {
            "path": obs_path,
            "path_exists": obs_path_exists,
            "is_dir": obs_dir_exists
        }
    })
    
  obs_group = zarr.open_group(obs_path, "r")
  
  result = {
    "labels": list(obs_group.categories),
    "label_map": obs_group.codes[:].tolist()
  }  

  return JSONResponse(content=json.dumps(result))


@app.get("/get_file_obsm")
async def get_file_obsm(file_id: str, obsm: str):
  
  obsm_path = os.path.join(UPLOAD_DIR, file_id, "obsm", obsm)
  obsm_path_exists = os.path.exists(obsm_path)
  obsm_dir_exists = os.path.isdir(obsm_path)

  # for obsm
  if (not obsm_path_exists or not obsm_dir_exists):
    return JSONResponse(content={
        "message": {
            "path": obsm_path,
            "path_exists": obsm_path_exists,
            "is_dir": obsm_dir_exists
        }
    })
    
  obsm_group = zarr.open_array(obsm_path, "r")
    
  result = {
    "coordinates": [x.tolist() for x in obsm_group]
  }
  
  return JSONResponse(content=json.dumps(result))

@app.get("/get_gene_expression")
async def get_gene_expression(file_id: str):
  
  # open X-group
  X_path = os.path.join(UPLOAD_DIR, file_id, "X")
  X_path_exists = os.path.exists(X_path)

  if (not X_path_exists):
    return JSONResponse(content={
        "message": {
            "path": X_path,
            "path_exists": X_path_exists,
        }
    })
    
  X_group = zarr.open_group(X_path)
  
  # CSR-matrix pieces
  data = X_group.data
  col_index = X_group.indices
  row_index = X_group.indptr
  
  n_cells = len(row_index)
  # n_genes = 
  
  
  # figure out if it's sparse or dense first
  
  # if indices, indptr and data exists, it's sparse.
  
  
  
@app.get("/measure_access_time")
async def measure_access_time(file_id: str, attr: str):
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  file_exists = os.path.exists(file_path)
  
  if (not file_exists):
    return JSONResponse(content={
      "file_path": file_path,
      "file_exists": file_exists
    })
  
  time_start = time.time()
  zarr_data = zarr.open(file_path, "r")
  time_end = time.time()
  elapsed_time = time_end - time_start
  
  print(zarr_data)
  
  return JSONResponse(content={
    "file_path": file_path,
    "elapsed_time": elapsed_time
  })

@app.post("/upload_file_chunk/")
async def upload_chunk(
    chunk: UploadFile = File(...),
    chunk_index: int = Form(...),
    total_chunks: int = Form(...),
    file_id: str = Form(...)
):
  """
  Receives and assembles a chunk-separated file uploaded from the thesis frontend application :)
  """

  logger.debug(["chunk", chunk_index])
  
  dir_path = os.path.join(UPLOAD_DIR, file_id)
  
  # Creates directory for file if it does not exist
  Path(dir_path).mkdir(parents=True, exist_ok=True)
  
  file_path = os.path.join(dir_path, f"{file_id}_chunk_{chunk_index}")

  # Save the chunk
  with open(file_path, "wb") as f:
    content = await chunk.read()
    f.write(content)

  dir_contents = os.listdir(dir_path)
  
  if (len(dir_contents) == total_chunks):
    return JSONResponse(
      content={
        "message": f"Chunk {chunk_index + 1} of {total_chunks} uploaded successfully. All chunks found."
      }
    )
  
  return JSONResponse(
    content={
      "message": f"Chunk {chunk_index + 1} of {total_chunks} uploaded successfully."
    }
  )
  
@app.get("/assemble_file")
def assemble_file(file_id: str, total_chunks: int):
  
  dir_path = os.path.join(UPLOAD_DIR, file_id)
  
  path_exists = os.path.exists(dir_path)
  is_dir = os.path.isdir(dir_path)
  
  if (not path_exists or not is_dir):
    return JSONResponse(
      content={
        "message": {
          "path_exists": path_exists,
          "is_dir": is_dir
        }
      }
    )
  
  dir_contents = sorted(os.listdir(dir_path), key=lambda x: int(x.split("_chunk_")[1]))
  
  dir_contents_len = len(dir_contents)
  
  if (dir_contents_len < total_chunks):
    return JSONResponse(
      content={
        "message": {
          "chunks_needed": total_chunks,
          "chunks": dir_contents_len
        }
      }
    )
  
  assembled_file_path = os.path.join(UPLOAD_DIR, f"{file_id}_assembled")
  
  with open(assembled_file_path, "wb") as assembled_file:
    
    for chunk_path in dir_contents:
      
      chunk_file_path = os.path.join(dir_path, chunk_path)
      
      with open(chunk_file_path, "rb") as chunk_file:
        assembled_file.write(chunk_file.read())
        
      os.remove(chunk_file_path)
  
  os.rmdir(dir_path)
  os.rename(assembled_file_path, dir_path)
  
  return JSONResponse(
    content={
      "message": f"File {file_id} successfully assembled from {dir_contents_len} chunks"
    }
  )

  


@app.get("/convert_file")
async def convert_h5ad_to_zarr(file_id: str, delete_after: bool=False):
  """
  Receives and assembles a chunk-separated file uploaded from the thesis frontend application :)
  """
  
  print("looking for file", file_id)
  
  file_path = os.path.join(UPLOAD_DIR, file_id)

  path_exists = os.path.exists(file_path)
  is_file = os.path.isfile(file_path)
  is_h5ad = file_path.split(".")[1].startswith("h5ad")
  
  if (not path_exists or not is_file or not is_h5ad):
    return JSONResponse(
        content={
            "message": {
                "path": file_path,
                "path_exists": path_exists,
                "is_file": is_file,
                "is_h5ad": is_h5ad
            }
        }
    )  
  
  print("converting file", file_path)
  
  file_name, file_type = file_id.split(".")
  file_type_cleaned, file_id = file_type.split("-")
  
  if "h5ad" in file_type_cleaned:
    
    print("reading h5ad")
    
    adata = ad.read_h5ad(file_path, backed="r")
    
    print("writing zarr")

    adata.write_zarr(
      os.path.join(UPLOAD_DIR, f"{file_name}-{file_id}.zarr")
    )
    
    if (delete_after):
      os.remove(file_path)
    
    return JSONResponse(content={"message": f"File converted to zarr"})
      
  
  elif "zarr" in file_type_cleaned:
    return JSONResponse(content={"message": f"File already in zarr format"})
  
  else:
    return JSONResponse(content={"message": f"Unsupported file type"})
