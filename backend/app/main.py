
import os
import dask.array
from fastapi.responses import JSONResponse
from fastapi import FastAPI
from fastapi import FastAPI
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, dotenv_values
import logging
from pathlib import Path
from math import ceil, log10
import zarr
import json
import time

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
  
  return JSONResponse(
    content={
      "zarr": list(filter(lambda x: x.endswith("zarr"), files)),
      "h5ad": list(filter(lambda x: x.endswith("h5ad"), files)),
      "files": list(files),
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
  file_id: str = File(...),
  adata_key: str = File(...),
  n_pcs: int = File(...),
  min_dist: float = File(...),
  spread: float = File(...),
  n_neighbors: int =File(...),
):
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  obj = "Something went wrong while generating UMAP"
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' is not a valid.")
  
  # if (file_path.endswith(".zarr")):
    # obj = zu.get_zarr_file_obsm(file_path, obsm)
  
  elif (file_path.endswith(".h5ad")):
    obj = au.generate_umap_h5ad(file_path, adata_key, n_pcs, min_dist, spread, n_neighbors)
  
  return JSONResponse(content={
    "response": "File has been successfully updated." if (obj) else "Something went wrong.",
    "data": obj
  })

@app.post("/generate_leiden/")
async def generate_leiden(
  file_id: str = File(...),
  adata_key: str = File(...),
  resolution: float = File(...),
):
  
  file_path = os.path.join(UPLOAD_DIR, file_id)
  obj = "Something went wrong while generating leiden"
  
  if (not os.path.exists(file_path)):
    return JSONResponse(content=f"File ID '{file_id}' is not a valid.")
  
  # if (file_path.endswith(".zarr")):
    # obj = zu.get_zarr_file_obsm(file_path, obsm)
  
  elif (file_path.endswith(".h5ad")):
    obj = au.generate_leiden_h5ad(file_path, adata_key, resolution)
  
  return JSONResponse(content={
    "response": "File has been successfully updated." if (obj) else "Something went wrong.",
    "data": obj
  })

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
  
#   path = os.path.join(UPLOAD_DIR, file_id)
#   path_exists = os.path.exists(path)

#   if (not path_exists):
#     return JSONResponse(content={
#         "message": {
#             "path": path,
#             "path_exists": path_exists,
#         }
#     })
  
#   var_path = os.path.join(UPLOAD_DIR, file_id, "var", "feature_name")
  
#   var_group = zarr.open_group(var_path)
  
#   gene_names = var_group.categories[:]
  
#   return JSONResponse(content=list(gene_names))


# @app.post("/get_top_gene_expression/")
# async def get_top_gene_expression(
#   file_id: str = File(...),
#   obs: str = File(...),
#   labels: list[str] = File(...),
#   genes: list[str] = File(...),
#   top_genes: int = 20
#   ):
  
#   print(file_id, obs, labels)
  
#   path = os.path.join(UPLOAD_DIR, file_id)
#   path_exists = os.path.exists(path)

#   if (not path_exists):
#     return JSONResponse(content={
#         "message": {
#             "path": path,
#             "path_exists": path_exists,
#         }
#     })
    
#   X_path = os.path.join(UPLOAD_DIR, file_id, "X")
#   obs_path = os.path.join(UPLOAD_DIR, file_id, "obs", obs)
#   var_path = os.path.join(UPLOAD_DIR, file_id, "var", "feature_name")
    
#   X_group = zarr.open_group(X_path)
#   obs_group = zarr.open_group(obs_path)
#   var_group = zarr.open_group(var_path)
  
#   obs_categories = obs_group.categories[:]
#   obs_codes = obs_group.codes[:]
  
#   all_gene_names = var_group.categories[:]
  
#   # global gene indices
#   gene_to_index = {gene_name: i for i, gene_name in enumerate(all_gene_names)}
  
#   # selected gene indices
#   selected_gene_to_index = []
  
#   # Iterate global indices and store the selected gene indices
#   for g in genes:  
#     if g in gene_to_index:
#       selected_gene_to_index.append(gene_to_index[g])
  
#   # convert to numpy 
#   selected_gene_to_index = np.array(selected_gene_to_index, dtype=int)
#   selected_gene_index_set = set(selected_gene_to_index)
  
#   subset_gene_names = all_gene_names[selected_gene_to_index]
  
#   # global-to-local mapping for CSR-matrix
#   global_to_local = {
#     global_index: local_index
#     for local_index, global_index in enumerate(selected_gene_index_set)
#   }
  
#   n_genes = len(selected_gene_index_set)
  
#   logger.debug(["# genes", n_genes])
#   logger.debug(["genes", selected_gene_to_index])
  
#   chunk_size = 5000
  
#   results = {}
  
#   # CSR-matrix pieces
#   data = X_group.data
#   col_index = X_group.indices
#   row_index = X_group.indptr
  
#   for label in labels:
    
#     results[label] = {}
    
#     # allocate space for the results of the selected genes
#     col_sums = np.zeros(n_genes, dtype=np.float64)
#     num_expr = np.zeros(n_genes, dtype=np.float64)
    
#     # Identify which cells (rows) belong to the current label
#     cat_index = np.where(obs_categories == label)[0]
#     cell_indices = np.where(obs_codes == cat_index)[0]
    
#     # Loop over the related cells in chunks
#     for i in range(0, len(cell_indices), chunk_size):
      
#       chunk = cell_indices[i : i + chunk_size]
      
#       # For each cell in the current batch:
#       for row in chunk:
#         start = row_index[row]
#         end   = row_index[row + 1]
        
#         row_cols = col_index[start:end] # non-zero columns
#         row_data = data[start:end] # non-zero column data
        
#         # Iterate over non-zero columns in the current row
#         for c, val in zip(row_cols, row_data):
          
#           # update sums if the current column is in the subset
#           if c in selected_gene_index_set:
            
#             local_index = global_to_local[c]
            
#             col_sums[local_index] += val
            
#             if (val > 0):
#               num_expr[local_index] += 1
    
#     # Then compute means
#     mean_expr = col_sums / len(cell_indices)
    
#     results[label]["mean_expr"] = mean_expr
#     results[label]["num_expr"] = num_expr
  
#   logger.debug(["lens", len(selected_gene_index_set), [len(x["mean_expr"]) for x in results.values()]])
#   logger.debug(["res", [x["mean_expr"] for x in results.values()]])
  
#   df_expr = pd.DataFrame(
#     data = [ x["mean_expr"] for x in results.values() ],
#     index = labels,
#     columns = subset_gene_names
#   )
  
#   df_num = pd.DataFrame(
#     data = [ x["num_expr"] for x in results.values() ],
#     index = labels,
#     columns = subset_gene_names
#   )
  
#   expr_max = df_expr.max(axis=0)
#   top_expr = expr_max.nlargest(top_genes).index
  
#   json_top_expr = df_expr[top_expr].to_dict("index")
#   json_top_num = df_num[top_expr].to_dict("index")
  
#   print("df_expr")
#   print(json_top_expr)
  
#   print("df_num")
#   print(json_top_num)
  
#   content = [
#     {
#       "label": x,
#       "mean_expr": json_top_expr[x],
#       "num_expr": json_top_num[x]
#     }
#     for x in json_top_expr.keys()
#   ]
  
#   return JSONResponse(content=json.dumps(content))
  
# @app.get("/measure_access_time")
# async def measure_access_time(file_id: str, attr: str):
  
#   file_path = os.path.join(UPLOAD_DIR, file_id)
#   file_exists = os.path.exists(file_path)
  
#   if (not file_exists):
#     return JSONResponse(content={
#       "file_path": file_path,
#       "file_exists": file_exists
#     })
  
#   time_start = time.time()
#   zarr_data = zarr.open(file_path, "r")
#   time_end = time.time()
#   elapsed_time = time_end - time_start
  
#   print(zarr_data)
  
#   return JSONResponse(content={
#     "file_path": file_path,
#     "elapsed_time": elapsed_time
#   })

# @app.post("/upload_file_chunk/")
# async def upload_chunk(
#     chunk: UploadFile = File(...),
#     chunk_index: int = Form(...),
#     total_chunks: int = Form(...),
#     file_id: str = Form(...)
# ):
#   """
#   Receives and assembles a chunk-separated file uploaded from the thesis frontend application :)
#   """

#   logger.debug(["chunk", chunk_index])
  
#   dir_path = os.path.join(UPLOAD_DIR, file_id)
  
#   # Creates directory for file if it does not exist
#   Path(dir_path).mkdir(parents=True, exist_ok=True)
  
#   file_path = os.path.join(dir_path, f"{file_id}_chunk_{chunk_index}")

#   # Save the chunk
#   with open(file_path, "wb") as f:
#     content = await chunk.read()
#     f.write(content)

#   dir_contents = os.listdir(dir_path)
  
#   if (len(dir_contents) == total_chunks):
#     return JSONResponse(
#       content={
#         "message": f"Chunk {chunk_index + 1} of {total_chunks} uploaded successfully. All chunks found."
#       }
#     )
  
#   return JSONResponse(
#     content={
#       "message": f"Chunk {chunk_index + 1} of {total_chunks} uploaded successfully."
#     }
#   )
  
# @app.get("/assemble_file")
# def assemble_file(file_id: str, total_chunks: int):
  
#   dir_path = os.path.join(UPLOAD_DIR, file_id)
  
#   path_exists = os.path.exists(dir_path)
#   is_dir = os.path.isdir(dir_path)
  
#   if (not path_exists or not is_dir):
#     return JSONResponse(
#       content={
#         "message": {
#           "path_exists": path_exists,
#           "is_dir": is_dir
#         }
#       }
#     )
  
#   dir_contents = sorted(os.listdir(dir_path), key=lambda x: int(x.split("_chunk_")[1]))
  
#   dir_contents_len = len(dir_contents)
  
#   if (dir_contents_len < total_chunks):
#     return JSONResponse(
#       content={
#         "message": {
#           "chunks_needed": total_chunks,
#           "chunks": dir_contents_len
#         }
#       }
#     )
  
#   assembled_file_path = os.path.join(UPLOAD_DIR, f"{file_id}_assembled")
  
#   with open(assembled_file_path, "wb") as assembled_file:
    
#     for chunk_path in dir_contents:
      
#       chunk_file_path = os.path.join(dir_path, chunk_path)
      
#       with open(chunk_file_path, "rb") as chunk_file:
#         assembled_file.write(chunk_file.read())
        
#       os.remove(chunk_file_path)
  
#   os.rmdir(dir_path)
#   os.rename(assembled_file_path, dir_path)
  
#   return JSONResponse(
#     content={
#       "message": f"File {file_id} successfully assembled from {dir_contents_len} chunks"
#     }
#   )

  


# @app.get("/convert_file")
# async def convert_h5ad_to_zarr(file_id: str, delete_after: bool=False):
#   """
#   Receives and assembles a chunk-separated file uploaded from the thesis frontend application :)
#   """
  
#   print("looking for file", file_id)
  
#   file_path = os.path.join(UPLOAD_DIR, file_id)

#   path_exists = os.path.exists(file_path)
#   is_file = os.path.isfile(file_path)
#   is_h5ad = file_path.split(".")[1].startswith("h5ad")
  
#   if (not path_exists or not is_file or not is_h5ad):
#     return JSONResponse(
#         content={
#             "message": {
#                 "path": file_path,
#                 "path_exists": path_exists,
#                 "is_file": is_file,
#                 "is_h5ad": is_h5ad
#             }
#         }
#     )  
  
#   print("converting file", file_path)
  
#   file_name, file_type = file_id.split(".")
#   file_type_cleaned, file_id = file_type.split("-")
  
#   if "h5ad" in file_type_cleaned:
    
#     print("reading h5ad")
    
#     adata = ad.read_h5ad(file_path, backed="r")
    
#     print("writing zarr")

#     adata.write_zarr(
#       os.path.join(UPLOAD_DIR, f"{file_name}-{file_id}.zarr")
#     )
    
#     if (delete_after):
#       os.remove(file_path)
    
#     return JSONResponse(content={"message": f"File converted to zarr"})
      
  
#   elif "zarr" in file_type_cleaned:
#     return JSONResponse(content={"message": f"File already in zarr format"})
  
#   else:
#     return JSONResponse(content={"message": f"Unsupported file type"})
