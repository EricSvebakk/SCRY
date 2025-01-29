
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
import dask
import zarr

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
logger.debug(["update v4"])

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

def file_exists(file_id: str):
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  return os.path.exists(file_path)
  


@app.get("/")
async def root():
  return JSONResponse(content={"message": "Thesis API"})


@app.get("/get_filenames")
async def get_filenames():
  return os.listdir(UPLOAD_DIR)


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
    if isinstance(obj, zarr.hierarchy.Array):
        return {
            "type": "array",
            "path": path,
            "shape": obj.shape,
            "dtype": str(obj.dtype),
            "chunks": obj.chunks
        }
    elif isinstance(obj, zarr.hierarchy.Group):
        children = {}
        for key in sorted(obj.keys()):
            subobj = obj[key]
            subpath = f"{path}/{key}" if path else key
            children[key] = get_zarr_hierarchy(subobj, subpath)
        return {
            "type": "group",
            "path": path,
            "children": children
        }
    else:
        raise TypeError(f"Unknown Zarr object type: {type(obj)}")
      
  if (not file_exists(file_id)):
    return JSONResponse(content={"message": f"File not found"})
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  
  zarr_group = zarr.open_group(file_path, mode="r")
  zarr_hierachy = get_zarr_hierarchy(zarr_group)
  
  return zarr_hierachy

  

@app.get("/get_file_information")
async def get_file_information(file_id: str):
  
  if (not file_exists(file_id)):
    return JSONResponse(content={"message": f"File not found"})
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  
  dask.array.from_zarr(file_path)
  
  # adata = ad.read_zarr(file_path)
  
  adata_serialized = convert_to_serializable(adata)
  
  return JSONResponse(content={
    "adata": adata_serialized
  })
  


@app.post("/upload_chunk/")
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

  file_path = os.path.join(UPLOAD_DIR, f"{file_id}_part{chunk_index}")

  # Save the chunk
  with open(file_path, "wb") as f:
    content = await chunk.read()
    f.write(content)

  #
  all_chunks_found = []
  assembled_file_name = None

  #
  for i in range(total_chunks):
    temp_path = os.path.join(UPLOAD_DIR, f"{file_id}_part{i}")

    path_exists = os.path.exists(temp_path)

    all_chunks_found.append(path_exists)

    #
    if len(all_chunks_found) == total_chunks and all(all_chunks_found):

      logger.debug([f"found all chunks"])

      assembled_file_name = f"{file_id}_assembled"

      assembled_file_path = os.path.join(UPLOAD_DIR, assembled_file_name)

      # create assembled file
      with open(assembled_file_path, "wb") as assembled_file:

        logger.info("assembling file")

        for i in range(total_chunks):

          chunk_path = os.path.join(UPLOAD_DIR, f"{file_id}_part{i}")

          with open(chunk_path, "rb") as part_file:
            assembled_file.write(part_file.read())
            
          # remove the chunk file after assembly
          os.remove(chunk_path)
        
        logger.info("finished assembling file")

      return JSONResponse(content={"message": f"Chunk {chunk_index + 1} of {total_chunks} uploaded successfully. Creation of '{assembled_file_name}' successful"})

  return JSONResponse(content={"message": f"Chunk {chunk_index + 1} of {total_chunks} uploaded successfully."})

@app.get("/assemble_file")
async def assemble_file(file_id: str):
  
  


@app.get("/convert_file")
async def convert_h5ad_to_zarr(file_id: str):
  """
  Receives and assembles a chunk-separated file uploaded from the thesis frontend application :)
  """
  
  logger.info(["converting file", file_id])
  logger.info(["looking for file"])
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  
  file_exists = os.path.exists(file_path)
  
  if not file_exists:
    return JSONResponse(content={"message": f"File not found"})
  
  logger.info(["file found", file_path])
  
  file_name, file_type = file_id.split(".")
  file_type_cleaned = file_type.split("-")[0]
  
  if "h5ad" in file_type_cleaned:
    adata = ad.read_h5ad(file_path, backed="r", chunk_size=ADATA_CHUNK_SIZE)
    
    adata.write_zarr(
      os.path.join(UPLOAD_DIR, f"{file_name}.zarr"),

    )
    
    if os.path.exists(os.path.join(UPLOAD_DIR, f"{file_name}.zarr")):
      os.remove(file_path)
    
    return JSONResponse(content={"message": f"File converted to zarr"})
      
  
  elif "zarr" in file_type_cleaned:
    return JSONResponse(content={"message": f"File already in zarr format"})
  
  else:
    return JSONResponse(content={"message": f"Unsupported file type"})
