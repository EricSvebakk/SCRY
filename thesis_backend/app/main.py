
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

def path_exists(path: str):
  file_path = os.path.join(UPLOAD_DIR, path)
  return os.path.exists(file_path)
  


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
  
  def get_zarr_hierarchy(obj, path=""):
    """
    Recursively traverse a Zarr group (or array) and return a nested dict
    describing the hierarchy. Includes metadata like shape, dtype, etc.
    """
  #   if isinstance(obj, zarr.hierarchy.Array):
  #       return {
  #           "type": "array",
  #           "path": path,
  #           "shape": obj.shape,
  #           "dtype": str(obj.dtype),
  #           "chunks": obj.chunks
  #       }
  #   elif isinstance(obj, zarr.hierarchy.Group):
  #       children = {}
  #       for key in sorted(obj.keys()):
  #           subobj = obj[key]
  #           subpath = f"{path}/{key}" if path else key
  #           children[key] = get_zarr_hierarchy(subobj, subpath)
  #       return {
  #           "type": "group",
  #           "path": path,
  #           "children": children
  #       }
  #   else:
  #       raise TypeError(f"Unknown Zarr object type: {type(obj)}")
      
  # if (not path_exists(file_id)):
  #   return JSONResponse(content={"message": f"File not found"})
  
  # file_path = os.path.join(UPLOAD_DIR, file_id)
  
  # zarr_group = zarr.open_group(file_path, mode="r")
  # zarr_hierachy = get_zarr_hierarchy(zarr_group)
  
  # return zarr_hierachy

  file_path = os.path.join(UPLOAD_DIR, file_id)

  print(file_path)

  zarr_data = zarr.open(file_path, "r")

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
async def get_file_information(file_id: str):
  
  pass  
  # if (not path_exists(file_id)):
  #   return JSONResponse(content={"message": f"File not found"})
  
  # file_path = os.path.join(UPLOAD_DIR, file_id)
  
  # print(file_path)
  
  # zarr_data = zarr.open(file_path, "r")
  
  # zarr_obj = {
  #     group_key: list(zarr_data[group_key].keys() if isinstance(zarr_data[group_key], zarr.Group) else [])
  #     for group_key in zarr_data.keys()
  # }
  
  # return JSONResponse(content=zarr_obj)
  
  # print(zarr_obj)
  
  # return JSONResponse(content={
  #   "obs": list(zarr_data["obs"].keys()),
  #   "obsm": list(zarr_data["obsm"].keys()),
  # })
  


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
