
import os
import json
import redis
import scanpy as sc
import pandas as pd
import numpy as np

from celery.result import AsyncResult
from celery import Celery, Task
from typing import Optional
from redis import Redis

from my_types import newObservation, BackendResponse
from util.context_manager import open_h5ad_read
from util.task_tracker import TaskRunner, StatusTracker
from util import task_steps as ts


CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")

REDIS_HOST = os.getenv("CELERY_HOST", "scry_redis")
REDIS_PORT = os.getenv("CELERY_PORT", "6379")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/persistent01")
DEBUG = os.getenv("UPLOAD_DIR", False)

url = f"redis://{REDIS_HOST}:{REDIS_PORT}/0"

celery_app = Celery(
  "worker",
  broker=url,
  backend=url
)

r = redis.Redis(host=REDIS_HOST, port=6379, db=0)

sc.settings.n_jobs = -1
sc.settings.max_memory = 256

import logging
logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.DEBUG)

if (DEBUG):
  print("URL", url)
  print("upload_dir", UPLOAD_DIR)
  print("n_jobs", sc.settings.n_jobs)
  print("max_m", sc.settings.max_memory)
  print("Redis", r.ping())
  print(celery_app)

def make_safe(obj):
  if isinstance(obj, np.ndarray):
    return obj.tolist()
  elif isinstance(obj, pd.DataFrame):
    return obj.to_dict(orient="records")
  elif isinstance(obj, (np.integer, np.floating)):
    return obj.item()
  elif isinstance(obj, dict):
    return {k: make_safe(v) for k, v in obj.items()}
  elif isinstance(obj, list):
    return [make_safe(v) for v in obj]
  elif isinstance(obj, (str, int, float, bool)) or obj is None:
    return obj
  else:
    return f"<<unsupported: {type(obj).__name__}>>"


def notStartWith(s1: str):
  return not s1.startswith("_")

# ============================================================================================
def get_tasks(file_path: str, user_id: str):
  
  try:
    key_user = StatusTracker.user_task_key(user_id)
    task_ids = [tid.decode() for tid in r.smembers(key_user)]
    items = []
    
    # logger.debug([key_user, task_ids])
    
    for tid in task_ids:
      meta_raw = r.hgetall(StatusTracker.task_meta_key(tid))
      meta = {k.decode(): v.decode() for k, v in meta_raw.items()} if meta_raw else {"task_id": tid}
      
      if (meta["file_id"] != os.path.basename(file_path)):
        continue

      ar = AsyncResult(tid)
      live_status = ar.status
      
      # Skip finished if not requested
      if live_status in ("SUCCESS", "FAILURE", "REVOKED"):
        continue

      meta.setdefault("status", live_status)
      
      # parse stored progress blob if present
      if "progress_meta" in meta:
        try:
          meta["progress_meta"] = json.loads(meta["progress_meta"])
        except Exception:
          pass
      
      items.append(meta)

    return {"response": items, "ok": True}
  
  except Exception as e:
    return {"response": f"Error fetching tasks: {e}", "ok": False}

# ============================================================================================
def get_metadata(file_path: str, user_id: str) -> BackendResponse:
  
  result: BackendResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
    "code": 500
  }
  
  metadata = {
    "hierarchy": None,
    "genes": None,
  }
  
  with open_h5ad_read(r, file_path, user_id) as adata:
    
    try: 
      
      metadata["hierarchy"] = {
        "obs":  list(filter(notStartWith, adata.obs_keys())),
        "var":  list(filter(notStartWith, adata.var_keys())),
        "uns": make_safe(adata.uns),
        "obsm": list(filter(notStartWith, adata.obsm_keys())),
        "varm": list(filter(notStartWith, adata.varm_keys())),
        "obsp": list(filter(notStartWith, list(adata.obsp.keys()))),
      }
      
      metadata["genes"] = list(adata.var_names)
      
      result["response"] = metadata
      result["ok"] = True
      result["code"] = 200
      
    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
      result["code"] = 500
      result["code"] = 500
      
  
  return result
  

# ============================================================================================
def get_hierarchy(file_path: str, user_id: str) -> BackendResponse:
  
  result: BackendResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
    "code": 500
  }
  
  with open_h5ad_read(r, file_path, user_id) as adata:
    
    try: 
      result["response"] = {
        "obs":  list(filter(notStartWith, adata.obs_keys())),
        "var":  list(filter(notStartWith, adata.var_keys())),
        "uns": make_safe(adata.uns),
        "obsm": list(filter(notStartWith, adata.obsm_keys())),
        "varm": list(filter(notStartWith, adata.varm_keys())),
        "obsp": list(filter(notStartWith, list(adata.obsp.keys()))),
      }
      result["ok"] = True
      result["code"] = 200

      
    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
      result["code"] = 500
  
  return result

# ============================================================================================
def get_genes(file_path: str, user_id: str) -> BackendResponse:
  
  result: BackendResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
    "code": 500
  }
  
  with open_h5ad_read(r, file_path, user_id) as adata:
  
    try:
      result["response"] = list(adata.var_names)
      result["ok"] = True
      result["code"] = 200
      
    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
      result["code"] = 500
  
  return result

# ============================================================================================
def get_observation(file_path: str, user_id: str, selectedObs: str) -> BackendResponse:
  
  result: BackendResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
    "code": 500
  }
  
  with open_h5ad_read(r, file_path, user_id) as adata:
    
    try:
      obs_data = adata.obs[selectedObs].astype("category")
      
      labels = list(obs_data.cat.categories)
      label_map = list(obs_data.cat.codes)
      
      result["response"] = {
        "categories": labels,
        "codes": label_map
      }
      result["ok"] = True
      result["code"] = 200
    
    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
      result["code"] = 500
    
  return result

# ============================================================================================
def get_obsm(file_path: str, user_id: str, selectedObsm: str) -> BackendResponse:
  
  result: BackendResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
    "code": 500
  }
  
  with open_h5ad_read(r, file_path, user_id) as adata:
  
    try:
      result["response"] = list(adata.obsm[selectedObsm][:, :2].tolist())
      result["ok"] = True
      result["code"] = 200
      
    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
      result["code"] = 500
  
  return result

# ============================================================================================
def get_feature_indices(file_path: str, user_id: str, feature_key: str) -> BackendResponse:

  result: BackendResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
    "code": 500
  }
  
  with open_h5ad_read(r, file_path, user_id) as adata:
    
    try:
      if (feature_key in adata.var.index):
        
        expr = np.ravel(
          adata[:, feature_key].X.toarray() 
          if not isinstance(adata[:, feature_key].X, np.ndarray) 
          else adata[:, feature_key].X
        )
        
        mask = expr > 0
        
        indices = np.where(mask)[0]
        values = expr[mask]
        
        result["response"] = {
          "categories": values.tolist(),  
          "codes": indices.tolist(),
        }
        result["ok"] = True
        result["code"] = 200
      
      else:
        result["response"] = "Feature key does not exist"
        result["ok"] = False
        result["code"] = 500
        
    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
      result["code"] = 500
  
  return result

# ============================================================================================
@celery_app.task(bind=True)
def compute_nldr(
  self: Task,
  file_path: str,
  user_id: str,
  key: str,
  n_pcs: int = 30,
  min_dist: float = 0.5,
  spread: float = 1.0,
  n_neighbors: int = 15,
) -> BackendResponse:
  
  runner = TaskRunner(
    r=r,
    task=self,
    file_path=file_path,
    user_id=user_id,
    func_name="compute_nldr",
    func_args=[key, n_pcs, min_dist, spread, n_neighbors]
  )
  
  key_pca = "X_pca"
  key_neighbors = f"{key}"
  key_umap = f"UMAP-{key}"
  
  runner.add_step(
    "Computing PCA",
    predicate=lambda ad: (key_pca not in ad.obsm_keys()) or (ad.obsm[key_pca].shape[1] < n_pcs),
    func=lambda ad: sc.pp.pca(
      ad,
      key_added=key_pca,
      n_comps=50
    )
  )
  
  runner.add_step(
    "Computing neighbors distance matrix",
    predicate=lambda ad: key_neighbors not in ad.uns_keys(),
    func=lambda ad: sc.pp.neighbors(
      ad,
      key_added=key_neighbors,
      use_rep=key_pca,
      n_pcs=n_pcs,
      n_neighbors=n_neighbors
    )
  )
  
  runner.add_step(
    "Computing UMAP",
    predicate=lambda ad: key_umap not in ad.obsm_keys(),
    func=lambda ad: sc.tl.umap(
      ad,
      neighbors_key=key_neighbors,
      key_added=key_umap,
      min_dist=min_dist, spread=spread
    )
  )
  
  result: BackendResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
  }
  
  try: 
    with runner as job:
      
      job.run_steps()
      
      if job.changes_made:
        sc.write(file_path, job.adata)
      
      embedding = job.adata.obsm[key_umap][:, :2].tolist()
      result["response"] = embedding
      result["ok"] = True
  
  except Exception as e:
    result["response"] = f"Something unexpected happened: {e}"
    result["ok"] = False
    result["code"] = 500
  
  return result
  
# ============================================================================================
@celery_app.task(bind=True)
def compute_leiden(
  self: Task,
  file_path: str,
  user_id: str,
  key: str,
  neighborsKey: str,
  resolution: float = 1
) -> BackendResponse:
  
  runner = TaskRunner(
    r=r,
    task=self,
    file_path=file_path,
    user_id=user_id,
    func_name="compute_nldr",
    func_args=[key, neighborsKey, resolution]
  )
  
  runner.add_step(
    "Computing Leiden clusters",
    predicate=lambda ad: neighborsKey not in ad.obs_keys(),
    func=lambda ad: sc.tl.leiden(
      ad,
      neighbors_key=neighborsKey,
      key_added=key,
      resolution=resolution,
      flavor="igraph"
    )
  )
  
  result: BackendResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
    "code": 500
  }
  
  try: 
    with runner as job:
      
      job.run_steps()
      
      if job.changes_made:
        sc.write(file_path, job.adata)
        
      obs_data = job.adata.obs[key].astype("category")
      
      result["response"] = {
        "categories": list(obs_data.cat.categories), # labels
        "codes": list(obs_data.cat.codes) # label-map
      }
      result["ok"] = True
      result["code"] = 200
        
  
  except Exception as e:
    result["response"] = f"Something unexpected happened: {e}"
    result["ok"] = False
    result["code"] = 500
  
  return result

# ============================================================================================
@celery_app.task(bind=True)
def compute_rgg(
  self: Task,
  file_path: str,
  user_id: str,
  uns_key: str,
  n_genes: int,
  selected_genes: Optional[list[str]]
) -> BackendResponse:
  
  runner = TaskRunner(
    r=r,
    task=self,
    file_path=file_path,
    user_id=user_id,
    func_name="compute_nldr",
    func_args=[uns_key, n_genes, selected_genes]
  )
  
  key_cluster = f"{uns_key}"
  key_rgg = f"rank_genes_groups_{uns_key}"
  key_dendrogram = f"dendrogram_{uns_key}"
  key_dotplot = f"dotplot_stats_g{n_genes}_{'_'.join(selected_genes).lower() if (selected_genes != None) else ''}_{uns_key}"
  
  runner.add_step(
    f"Computing gene-rankings from the clustering '{uns_key}'",
    predicate=lambda ad: key_rgg not in ad.uns_keys(),
    func=lambda ad: sc.tl.rank_genes_groups(
      ad,
      method="wilcoxon",
      groupby=key_cluster,
      key_added=key_rgg
    )
  )
  
  runner.add_step(
    "Computing dendrogram",
    predicate=lambda ad: key_dendrogram not in ad.uns_keys(),
    func=lambda ad: sc.tl.dendrogram(
      ad,
      groupby=key_cluster,
      key_added=key_dendrogram
    )
  )
  
  runner.add_step(
    "Computing dotplot table",
    predicate=lambda ad: key_dotplot not in ad.uns_keys(),
    func=lambda ad: ts.handle_dge_data(
      ad,
      key_cluster=key_cluster,
      key_dotplot=key_dotplot,
      key_rgg=key_rgg,
      key_dendrogram=key_dendrogram,
      n_genes=n_genes,
      selected_genes=selected_genes
    )
  )
  
  result: BackendResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
    "code": 500
  }
  
  try: 
    with runner as job:
      
      job.run_steps()
      
      if job.changes_made:
        sc.write(file_path, job.adata)
      
      dotplot = job.adata.uns["key_dotplot"]
      data = pd.DataFrame(dotplot["table"]).to_dict(orient="records")
      dotplot["table"] = data
      
      result["response"] = dotplot
      result["ok"] = True
      result["code"] = 200
  
  except Exception as e:
    result["response"] = f"Something unexpected happened: {e}"
    result["ok"] = False
    result["code"] = 500
  
  return result
  

@celery_app.task(bind=True)
def compute_save_file_as(
  self: Task,
  file_path: str,
  user_id: str,
  new_file_id: str,
  selected_obs: str,
  selected_obs_clusters: list[str],
) -> BackendResponse:
  
  runner = TaskRunner(
    r=r,
    task=self,
    file_path=file_path,
    user_id=user_id,
    func_name="compute_nldr",
    func_args=[new_file_id, selected_obs, selected_obs_clusters]
  )
  
  result: BackendResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
    "code": 500
  }
  
  try:
    
    with runner as job:
      
      adata = job.adata
      
      subset_mask = adata.obs[selected_obs].isin(selected_obs_clusters)
      
      adata_subset = adata[subset_mask, :]
      
      subset_file_path = os.path.join(UPLOAD_DIR, new_file_id)
      
      sc.write(subset_file_path, adata_subset)
    
    result["response"] = "Slicing successful"
    result["ok"] = True
    result["code"] = 200
  
  except Exception as e:
    errorMessage = f"Something unexpected happened: {e}"
    result["response"] = errorMessage
    result["ok"] = False
    result["code"] = 500
  
# ============================================================================================
@celery_app.task(bind=True)
def compute_celltypist_annotations(
  self: Task,
  file_path: str,
  user_id: str,
  key: str,
  connectivities_key: str,
  annotation_model: str = "Immune_All_Low.pkl",
) -> BackendResponse:
  
  uns_key = f"celltypist_metadata_{key}"
  
  runner = TaskRunner(
    r=r,
    task=self,
    file_path=file_path,
    user_id=user_id,
    func_name="compute_nldr",
    func_args=[key, connectivities_key, annotation_model]
  )
  
  runner.add_step(
    f"Predicting clusters using model '{annotation_model}'",
    predicate=lambda ad: uns_key not in ad.uns_keys(),
    func=lambda ad: ts.handle_annotation(
      ad,
      obs_prefix=key,
      connectivities_key=connectivities_key,
      annotation_model=annotation_model
    )
  )
  
  result: BackendResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
    "code": 500
  }
  
  try:
    
    with runner as job:
      
      job.run_steps()
      
      if job.changes_made:
        sc.write(file_path, job.adata)
      
      obs_data = job.adata.obs[f"{key}_majority_voting"].astype("category")
      
      result["response"] = {
        "categories": list(obs_data.cat.categories), # labels
        "codes": list(obs_data.cat.codes) # label-map
      }
      result["ok"] = True
      result["code"] = 200
      
  except Exception as e:
  
    logger.debug(["ERROR", e])
    
    errorMessage = f"OKAY Something unexpected happened: {e}"
    result["response"] = errorMessage
    result["ok"] = False
    result["code"] = 500
  
  return result
  
# ============================================================================================
@celery_app.task(bind=True)
def compute_recluster(
  self: Task,
  file_path: str,
  user_id: str,
  observation_dict: dict
) -> BackendResponse:
  
  runner = TaskRunner(
    r=r,
    task=self,
    file_path=file_path,
    user_id=user_id,
    func_name="compute_nldr",
    func_args=[observation_dict]
  )
  
  observation = newObservation.model_validate(observation_dict)
  
  runner.add_step(
    f"Creating new observation '{observation.name}'",
    predicate=lambda ad: observation.name not in ad.obs_keys(),
    func=lambda ad: ts.handle_reclustering(ad, observation_dict)
  )
  
  result: BackendResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
    "code": 500
  }
  
  try:
    
    with runner as job:
      
      if job.changes_made:
        sc.write(file_path, job.adata)
    
      obs_key = observation.name
      
      result["response"] = obs_key
      result["ok"] = True
      result["code"] = 200
    
  
  except Exception as e:
    errorMessage = f"Something unexpected happened: {e}"
    result["response"] = errorMessage
    result["ok"] = False
    result["code"] = 500
  
  return result

# ============================================================================================
@celery_app.task(bind=True)
def compute_merge_data(
  self: Task,
  file_path_src: str,
  user_id: str,
  file_id_dest: str,
  observation_dict: dict
) -> BackendResponse:
  
  file_path_dest = os.path.join(UPLOAD_DIR, file_id_dest)
  
  runner = TaskRunner(
    r=r,
    task=self,
    file_path=file_path_dest,
    user_id=user_id,
    func_name="compute_nldr",
    func_args=[file_id_dest, observation_dict]
  )
  
  
  runner.add_step(
    "Transferring metadata between AnnData objects",
    predicate=lambda ad: ad,
    func=lambda ad: ts.handle_merging(ad, file_path_src, observation_dict, r, )
  )
  
  result: BackendResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
    "code": 500
  }
  
  try:
    
    with runner as job:
      
      job.run_steps()
      
      adata_dest = job.adata
      
      if (job.changes_made):
        sc.write(file_id_dest, adata_dest)
    
      result["response"] = {
        "obs":  list(filter(notStartWith, adata_dest.obs_keys())),
        "var":  list(filter(notStartWith, adata_dest.var_keys())),
        "uns": make_safe(adata_dest.uns),
        "obsm": list(filter(notStartWith, adata_dest.obsm_keys())),
        "varm": list(filter(notStartWith, adata_dest.varm_keys())),
        "obsp": list(filter(notStartWith, list(adata_dest.obsp.keys()))),
      }
      result["ok"] = True
      result["code"] = 200 
  
  except Exception as e:
    errorMessage = f"Something unexpected happened: {e}"
    result["response"] = errorMessage
    result["ok"] = False
    result["code"] = 500

  return result