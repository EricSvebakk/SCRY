
import os
from fastapi.responses import JSONResponse

def valid_file(dir_path: str, file_id: str):
  
  file_path = os.path.join(dir_path, file_id)
  obj = "Something went wrong while fetching obs"
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' is not a valid.")
  
  if (file_path.endswith(".zarr")):
    obj = zu.get_zarr_file_obsm(file_path, obsm)
  
  elif (file_path.endswith(".h5ad")):
    obj = au.get_anndata_file_obsm(file_path, obsm)
  
  if (obj is None):
    return JSONResponse(content="Something went wrong.")