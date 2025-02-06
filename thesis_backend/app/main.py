
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
from math import ceil
import dask.array
import zarr
import json

# from serialize_util import convert_to_serializable


load_dotenv()
app = FastAPI()
config = dotenv_values(".env")
adata = None

UPLOAD_DIR = "/code/thesis_data"
FRONTEND_ENDPOINT = os.environ.get("FRONTEND_ENDPOINT")
ADATA_CHUNK_SIZE = 1000
UPLOAD_CHUNK_SIZE = 1024 * 1024 * 10 # 1MB chunks

logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.DEBUG)

logger.debug(["config", FRONTEND_ENDPOINT])

# Creates directory if it does not exist
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_ENDPOINT,
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],        # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],        # Allow all headers
)

@app.get("/")
async def root():
  return JSONResponse(content={
      "message": "Thesis API",
      "files": list(filter(lambda x: x.endswith("zarr"), os.listdir(UPLOAD_DIR)))
  })


@app.get("/get_filenames")
async def get_filenames():
  return list(filter(lambda x: x.endswith("zarr"), os.listdir(UPLOAD_DIR)))


@app.get("/get_file_size")
async def get_file_size(file_id: str):
  filesize = os.path.getsize(f"{UPLOAD_DIR}/{file_id}")
  
  logger.info(["HELLO", filesize])
  
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
  
  print(zarr_data.tree())

  zarr_obj = {
      group_key: list(
          zarr_data[group_key].keys()
          if isinstance(zarr_data[group_key], zarr.Group)
          else []
      )
      for group_key in zarr_data.keys()
  }

  return JSONResponse(content=zarr_obj)


@app.get("/get_file_information")
async def get_file_information(file_id: str, component: str):
  
  file_path = os.path.join(UPLOAD_DIR, file_id) 

  if (not os.path.exists(file_path) or not os.path.isdir(file_path)):
    return JSONResponse(content={"message": f"File not found"})
  
  components = component.split("/")
  zarr_data = zarr.open_group(file_path, "r")
  
  # 
  def recursive_indexing(obj, keys):
    
    print("ri", obj)
    
    if len(keys) == 0: 
      return obj
    elif len(keys) == 1:
      return obj[keys[0]]
    else:
      return recursive_indexing(obj[keys[0]], keys[1:])
  
  print(file_id, components, zarr_data)
  
  result = recursive_indexing(zarr_data, components)
  
  return list(result)


@app.get("/get_file_obs")
async def get_file_obs(file_id: str):

  file_path = os.path.join(UPLOAD_DIR, file_id)

  # print(file_path)

  zarr_data = zarr.open(file_path, "r")

  # print(zarr_data.tree())

  zarr_obj = {
      "obs": list(
          filter(
              lambda x: isinstance(zarr_data.obs[x], zarr.Group),
              zarr_data.obs.keys()
          )
      ),
      "obsm": list(
        zarr_data.obsm.keys()
      )
      # for group_key in zarr_data.keys()
  }

  return JSONResponse(content=zarr_obj)

@app.get("/get_file_obsm")
async def get_file_obsm(file_id: str, obsm: str, obs: str):
  
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

  obsm_group = zarr.open_array(obsm_path, "r")
  obs_group = zarr.open_group(obs_path, "r")
  
  # obsm_group
  
  print(type(obsm_group), type(obsm_group[0]))
  print(obs_group.codes)
  
  result = {
    "coordinates": [x.tolist() for x in obsm_group],
    "labels": list(obs_group.categories),
    "label_map": obs_group.codes[:].tolist(),
  }
  
  return JSONResponse(content=json.dumps(result))
  

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
def assemble_file(file_id: str):
  
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
async def convert_h5ad_to_zarr(file_id: str):
  """
  Receives and assembles a chunk-separated file uploaded from the thesis frontend application :)
  """
  
  logger.info(["looking for file"])
  
  file_path = os.path.join(UPLOAD_DIR, file_id)

  path_exists = os.path.exists(file_path)
  is_file = os.path.isfile(file_path)
  is_h5ad = file_path.split(".")[1].startswith("h5ad")
  
  if (not path_exists or not is_file or not is_h5ad):
    return JSONResponse(
        content={
            "message": {
                "path_exists": path_exists,
                "is_file": is_file,
                "is_h5ad": is_h5ad
            }
        }
    )  
  
  logger.info(["converting file", file_path])
  
  file_name, file_type = file_id.split(".")
  file_type_cleaned, file_id = file_type.split("-")
  
  if "h5ad" in file_type_cleaned:
    
    logger.info(["reading h5ad"])
    
    adata = ad.read_h5ad(file_path, backed="r")
    
    logger.info(["writing zarr"])

    adata.write_zarr(
      os.path.join(UPLOAD_DIR, f"{file_name}-{file_id}.zarr"),

    )
    
    if os.path.exists(os.path.join(UPLOAD_DIR, f"{file_name}.zarr")):
      os.remove(file_path)
    
    return JSONResponse(content={"message": f"File converted to zarr"})
      
  
  elif "zarr" in file_type_cleaned:
    return JSONResponse(content={"message": f"File already in zarr format"})
  
  else:
    return JSONResponse(content={"message": f"Unsupported file type"})
