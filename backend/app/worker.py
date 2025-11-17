
import os
from celery import Celery
from celery.result import AsyncResult
import scanpy as sc
import pandas as pd
import numpy as np
import celltypist as ct
import anndata as ad

import json
import time
import copy
from typing import Optional
from anndata import AnnData
from dataclasses import dataclass
from functools import partial
from typing import Callable, Set
from my_types import newObservation, ComputationResponse
from contextlib import contextmanager
from fastapi import HTTPException
import redis
from scipy.cluster.hierarchy import to_tree

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

@dataclass
class PipelineStep:
  description: str
  func: Callable[[], bool]

# ============================================================================================
def _task_meta_key(task_id: str) -> str:
  return f"task_meta:{task_id}"

def _user_tasks_key(user_id: str) -> str:
  return f"user_tasks:{user_id}"

def _set_task_status(task_id: str, status: str, meta: dict | None = None):
  key = _task_meta_key(task_id)
  m = {"status": status, "updated_at": str(int(time.time()) * 1000)}
  if meta:
      # store a short JSON of your progress meta (current/total/step)
      m["progress_meta"] = json.dumps(meta)
  r.hset(key, mapping=m)
  # refresh TTL
  r.expire(key, 7 * 24 * 3600)

def _finalize_task(task_id: str, user_id: str, status: str, error: str | None = None):
  key = _task_meta_key(task_id)
  m = {"status": status, "finished_at": str(int(time.time()) * 1000)}
  if error:
      m["error"] = error[:1000]
  pipe = r.pipeline()
  pipe.hset(key, mapping=m)
  pipe.expire(key, 7 * 24 * 3600)
  
  # remove from user index if you only want “running” in the set;
  # if you prefer to keep recent finished in the list, comment this out.
  pipe.srem(_user_tasks_key(user_id), task_id)
  pipe.execute()

def register_task_for_user(user_id: str, file_id: str, task_id: str, func_name: str, args: list):
  key_user = _user_tasks_key(user_id)
  key_meta = _task_meta_key(task_id)
  now = int(time.time()) * 1000
  meta = {
      "user_id": user_id,
      "file_id": os.path.basename(file_id),
      "task_id": task_id,
      "task_name": func_name,
      "created_at": str(now),
      "status": "PENDING",
      "func": func_name,
      "args_json": json.dumps(args),
  }
  pipe = r.pipeline()
  pipe.sadd(key_user, task_id)
  pipe.hset(key_meta, mapping=meta)
  pipe.expire(key_meta, 7 * 24 * 3600)  # keep metadata 7 days
  pipe.execute()
  
  return meta

# ============================================================================================
@contextmanager
def _file_lock(file_path: str, user_id: str, timeout: int = 600, blocking: bool = True, blocking_timeout: float | None = None):
  lock_key = f"filelock:{file_path}"
  meta_key = f"{lock_key}:meta"

  lock = r.lock(lock_key, timeout=timeout)
  is_locked = lock.acquire(blocking=blocking, blocking_timeout=blocking_timeout)

  if not is_locked:
    current_user = r.hget(meta_key, "user_id")
    raise HTTPException(
      status_code=423,
      detail=f"File '{os.path.basename(file_path)}' is already locked by {current_user.decode() if current_user else 'unknown'}",
    )

  r.hset(meta_key, mapping={"user_id": user_id, "started_at": str(int(time.time()) * 1000)})

  try:
    yield
  finally:
    if is_locked:
      try:
        lock.release()
      except redis.exceptions.LockError:
        pass
      r.delete(meta_key)

@contextmanager
def open_h5ad_read(file_path: str, user_id: str, timeout: int = 600):
  
  with _file_lock(file_path, user_id, timeout=timeout, blocking=True, blocking_timeout=timeout):
  
    adata = None
    
    try:
      adata = sc.read_h5ad(file_path, backed="r")
      yield adata
      
    except Exception as e:
      print(f"Something unexpected happened while opening the file: {e}")
      raise
    
    finally:
      if adata is not None and getattr(adata, "file", None) is not None:
        adata.file.close()

@contextmanager
def open_h5ad_write(file_path: str, user_id: str, timeout: int = 600):
  
  with _file_lock(file_path, user_id, timeout=timeout, blocking=True):
    
    adata = None  # backed=None by default
    
    try:
      adata = sc.read_h5ad(file_path)
      yield adata
      
    except Exception as e:
      print(f"Something unexpected happened while opening the file: {e}")
      raise
      
    finally:
      pass

# ============================================================================================
def start_progress(task):
  
  meta = {
    "current": 0,
    "total": None,
    "step": "Opening AnnData object",
    "status": f"Opening AnnData object"
  }
  
  task.update_state(
    state="PROGRESS",
    meta=meta
  )
  
  _set_task_status(task.request.id, "PROGRESS", meta)

def end_progress(task):
  
  meta = {
    "current": 0,
    "total": None,
    "step": "Writing new data to AnnData object",
    "status": f"Writing new data to AnnData object"
  }
  
  task.update_state(
    state="PROGRESS",
    meta=meta
  )
  
  _set_task_status(task.request.id, "PROGRESS", meta)

def simple_update_progress(task, status: str):
  
  meta = {
    "current": 1,
    "total": 1,
    "step": status,
    "status": "Status: " + status
  }
    
  task.update_state(
    state="PROGRESS",
    meta=meta
  )
  
  _set_task_status(task.request.id, "PROGRESS", meta)
  

def update_progress(task, step_index: int, steps: list[str]):
  total = len(steps)
  
  if (step_index >= 0) and (step_index < total):
    
    meta = {
      "current": step_index + 1,
      "total": total,
      "step": steps[step_index],
      "status": f"Step {step_index + 1}/{total if (total != 1) else 'X'}: {steps[step_index]}"
    }
    
    task.update_state(
      state="PROGRESS",
      meta=meta
    )
    
    _set_task_status(task.request.id, "PROGRESS", meta)

# ============================================================================================
def handle_pipeline_steps(task, pipeline_steps: list[PipelineStep]):
  
  changes_made = False
  step_current = 0
  
  pipeline_description_steps = [x.description for x in pipeline_steps]

  for step in pipeline_steps:
    
    print(step.description)
    
    update_progress(task, step_current, pipeline_description_steps)
    changes_made = step.func() or changes_made
    
    step_current += 1
  
  return changes_made

# ============================================================================================
def handle_pca(adata: AnnData, key_pca: str, n_pcs: int) -> bool:
  
  changes_made = False
  
  if (not (key_pca in adata.obsm_keys())) or (adata.obsm[key_pca].shape[1] < n_pcs):
    
    changes_made = True
    sc.pp.pca(
      adata,
      key_added=key_pca,
      n_comps=n_pcs,
    )
  
  return changes_made

def handle_neighbors(adata: AnnData, key_neighbors: str, key_pca: str, n_pcs: int, n_neighbors: int) -> bool:
  
  changes_made = False
  
  if not (key_neighbors in adata.uns_keys()):
    
    changes_made = True
    sc.pp.neighbors(
      adata,
      key_added=key_neighbors,
      use_rep=key_pca,
      n_pcs=n_pcs,
      n_neighbors=n_neighbors
    )
  
  return changes_made

def handle_umap(adata: AnnData, key_umap: str, key_neighbors: str, min_dist: int, spread: int) -> bool:
  
  changes_made = False
  
  if not (key_umap in adata.obsm_keys()):

    changes_made = True
    sc.tl.umap(
      adata,
      neighbors_key=key_neighbors,
      key_added=key_umap,
      min_dist=min_dist,
      spread=spread,
    )
  
  return changes_made

def handle_leiden(adata: AnnData, key_neighbors: str, key_observation: str, resolution: float) -> bool:
  
  changes_made = False
  
  if not (key_observation in adata.obs_keys()):
    
    changes_made = True
    sc.tl.leiden(
      adata,
      neighbors_key=key_neighbors,
      key_added=key_observation,
      resolution=resolution,
      flavor="igraph"
    )
  
  return changes_made

def handle_rank_genes_groups(adata: AnnData, key_cluster: str, key_rgg: str) -> bool:
  
  changes_made = False
  
  if not (key_rgg in adata.uns_keys()):
  
    changes_made = True
    sc.tl.rank_genes_groups(
      adata,
      method="wilcoxon",
      groupby=key_cluster,
      key_added=key_rgg
    )
    
  return changes_made

def handle_load_model(adata: AnnData):
  
  changes_made = False
  
  if (False):
    pass
  
  return changes_made

def handle_predict_annotation(adata: AnnData, annotation_model: str):
  
  changes_made = False
  
  if (len(annotation_model) > 0):
    
    model = ct.models.Model.load(model = annotation_model)
      
    predictions = ct.annotate(adata, model = model, majority_voting = True)
    
    changes_made = True
  
  return changes_made

def build_dendrogram_tree(linkage_matrix, labels: list[str]):
  
  tree, nodes = to_tree(linkage_matrix, rd=True)
  
  def add_node(node):
    if node.is_leaf():
      return {"name": node.id}
    else:
      return {
        "name": None,
        "children": [add_node(node.left), add_node(node.right)],
        # "distance": node.dist
      }

  return add_node(tree)

def sort_by_dendro_rgg_rbb_order(df: pd.DataFrame, dendro_order: list[str], n_genes: int):
  
  # Sorts dataframe by dendro-order, then by rgg-order
  sorted_df = (
    df
    .assign(dendro_order=pd.Categorical(df["cluster"], categories=dendro_order, ordered=True))
    .assign(dendro_order=lambda x: x["dendro_order"].cat.codes)
    .sort_values(by=["dendro_order", "rgg_order"])
  )

  # Sorts dataframe further by round-robin-batch-order
  # NOTE: within_cluster_rank is reliant on the correct previous sorting given by rgg_order and rank
  sorted_df = (
    sorted_df
      .assign(
        within_cluster_rank=sorted_df.groupby("cluster").cumcount(),
        batch=lambda temp_df: temp_df["within_cluster_rank"] // n_genes
      )
      .sort_values(
        by=[
          "batch",
          "dendro_order",
        ],
        ascending=[
          True,
          True,
        ]
      )
      # .drop(columns=["dendro_order", "within_cluster_rank", "batch"])
  )
  
  return sorted_df

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

def handle_dendrogram(adata: AnnData, key_cluster: str, key_dendrogram: str) -> bool:
  
  changes_made = False
  
  if not (key_dendrogram in adata.uns_keys()):
  
    changes_made = True
    sc.tl.dendrogram(adata, groupby=key_cluster, key_added=key_dendrogram)
    
  return changes_made

def handle_rgg_data_table(adata: AnnData, key_cluster: str, key_dotplot: str, key_rgg: str, n_genes: int, selected_genes: Optional[list[str]]) -> bool:
  
  if (key_dotplot in adata.uns_keys()):
    return False
  
  rgg = adata.uns[key_rgg]
  
  top_genes = set()
  for group in rgg["names"].dtype.names:
    top_genes.update(rgg["names"][group][:n_genes])
  
  fig = sc.pl.rank_genes_groups_dotplot(
    adata,
    key=key_rgg,
    var_names=list(top_genes),
    return_fig=True
  )
  
  mean_expr_df = fig.dot_color_df
  frac_expr_df = fig.dot_size_df
  
  mean_expr_df_no_dup = mean_expr_df.loc[:, ~mean_expr_df.T.duplicated()]
  frac_expr_df_no_dup = frac_expr_df.loc[:, ~frac_expr_df.T.duplicated()]
  
  n_genes_present = len(mean_expr_df_no_dup.columns)
  
  mean_expr_long = (
    mean_expr_df_no_dup
      .reset_index()
      .melt(id_vars="index", var_name="gene", value_name="mean_expr")
      .rename(columns={"index": "cluster"})
  )
  
  frac_expr_long = (
    frac_expr_df_no_dup
    .reset_index()
    .melt(id_vars="index", var_name="gene", value_name="frac_expr")
    .rename(columns={"index": "cluster"})
  )
  
  merged_expr = mean_expr_long.merge(frac_expr_long, on=["gene", "cluster"])
  
  # Get remaining data not provided by fig
  pvals = []
  logfcs = []
  ranks = []
  
  for index, row in merged_expr.iterrows():
    
    gene, group = row["gene"], row["cluster"]
    
    try:
      gene_list = rgg["names"][group]
      
      index = list(gene_list).index(gene)
      
      pval = rgg["pvals_adj"][group][index]
      logfc = rgg["logfoldchanges"][group][index]
      rank = index
      
    except ValueError:
      pval = None
      logfc = None
      rank = None
      
    pvals.append(pval)
    logfcs.append(logfc)
    ranks.append(rank)
  
  merged_expr["pvals_adj"] = pvals
  merged_expr["logfoldchange"] = logfcs
  merged_expr["rgg_order"] = ranks
  
  filtered_df = merged_expr[merged_expr["pvals_adj"] < 0.05]
  
  adata.uns[key_dotplot] = {
    "data": filtered_df.to_dict(orient="list"),
    "n_genes": n_genes_present,
    "params": {
      "clustering": key_cluster,
      "n_top_genes": n_genes,
      "selected_genes": selected_genes,
    }
  }
  
  return True

def notStartWith(s1: str):
  return not s1.startswith("_")

def make_safe(obj):
  if isinstance(obj, np.ndarray):
    return None
  elif isinstance(obj, pd.DataFrame):
    return obj.to_dict(orient="records")
  elif isinstance(obj, (np.integer, np.floating)):
    return obj.item()
  elif isinstance(obj, dict):
    return {k: make_safe(v) for k, v in obj.items()}
  elif isinstance(obj, list):
    return None
  elif isinstance(obj, (str, int, float, bool)) or obj is None:
    return obj
  else:
    return f"<<unsupported: {type(obj).__name__}>>"

# ============================================================================================
def get_tasks(file_path: str, user_id: str):
  
  try:
    key_user = _user_tasks_key(user_id)
    task_ids = [tid.decode() for tid in r.smembers(key_user)]
    items = []
    
    # logger.debug([key_user, task_ids])
    
    for tid in task_ids:
      meta_raw = r.hgetall(_task_meta_key(tid))
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
def get_metadata(file_path: str, user_id: str):
  
  result: ComputationResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
  }
  
  metadata = {
    "hierarchy": None,
    "genes": None,
  }
  
  with open_h5ad_read(file_path, user_id) as adata:
    
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
      
    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
  
  return result
  

# ============================================================================================
def get_hierarchy(file_path: str, user_id: str):
  
  result: ComputationResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
  }
  
  with open_h5ad_read(file_path, user_id) as adata:
    
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
      
    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
  
  return result

# ============================================================================================
def get_genes(file_path: str, user_id: str):
  
  result: ComputationResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
  }
  
  with open_h5ad_read(file_path, user_id) as adata:
  
    try:
      result["response"] = list(adata.var_names)
      result["ok"] = True
      
    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
  
  return result

# ============================================================================================
def get_observation(file_path: str, user_id: str, selectedObs: str):
  
  result: ComputationResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
  }
  
  with open_h5ad_read(file_path, user_id) as adata:
    
    try:
      obs_data = adata.obs[selectedObs].astype("category")
      
      labels = list(obs_data.cat.categories)
      label_map = list(obs_data.cat.codes)
      
      result["response"] = {
        "categories": labels,
        "codes": label_map
      }
      result["ok"] = True
    
    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
    
  return result

# ============================================================================================
def get_obsm(file_path: str, user_id: str, selectedObsm: str):
  
  result: ComputationResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
  }
  
  with open_h5ad_read(file_path, user_id) as adata:
  
    try:
      result["response"] = list(adata.obsm[selectedObsm][:, :2].tolist())
      result["ok"] = True
      
    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
  
  return result

# ============================================================================================
def get_feature_indices(file_path: str, user_id: str, feature_key: str):

  result: ComputationResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
  }
  
  with open_h5ad_read(file_path, user_id) as adata:
    
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
      
      else:
        result["response"] = "Feature key does not exist"
        result["ok"] = False
        
    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
  
  return result

# ============================================================================================
@celery_app.task(bind=True)
def compute_ldr(
  self,
  file_path: str,
  user_id: str,
  n_pcs: int = 30,
):
  
  start_progress(self)
  
  
  result: ComputationResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
  }
  
  with open_h5ad_write(file_path, user_id) as adata:
  
    try:
      key_pca = "X_pca"
      
      changes_made = handle_pipeline_steps(self, [
        PipelineStep("Computing PCA", partial(handle_pca, adata, key_pca, n_pcs)),
      ])
      
      end_progress(self)
      
      if (changes_made):
        sc.write(file_path, adata)
      
      result["response"] = list(adata.obsm[key_pca][:, :2].tolist())
      result["ok"] = True
      
      _finalize_task(self.request.id, user_id, "SUCCESS")
      
    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
      
      _finalize_task(self.request.id, user_id, "FAILURE", error=str(e))
  
  return result

# ============================================================================================
@celery_app.task(bind=True)
def compute_nldr(
  self,
  file_path: str,
  user_id: str,
  key: str,
  n_pcs: int = 30,
  min_dist: float = 0.5,
  spread: float = 1.0,
  n_neighbors: int = 15,
):
  
  start_progress(self)
  
  result: ComputationResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
  }
  
  with open_h5ad_write(file_path, user_id) as adata:
    
    try:
      key_pca = "X_pca"
      key_neighbors = f"{key}"
      key_umap = f"UMAP-{key}"
      
      changes_made = handle_pipeline_steps(self, [
        PipelineStep("Computing PCA", partial(handle_pca, adata, key_pca, 50)),
        PipelineStep("Computing neighbors distance matrix", partial(handle_neighbors, adata, key_neighbors, key_pca, n_pcs, n_neighbors)),
        PipelineStep("Computing UMAP", partial(handle_umap, adata, key_umap, key_neighbors, min_dist, spread)),
      ])
      
      end_progress(self)
      
      if changes_made:
        sc.write(file_path, adata)
      
      result["response"] = list(adata.obsm[key_umap][:, :2].tolist())
      result["ok"] = True
      _finalize_task(self.request.id, user_id, "SUCCESS")
      
    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
      _finalize_task(self.request.id, user_id, "FAILURE", error=str(e))
  
  return result
  
# ============================================================================================
@celery_app.task(bind=True)
def compute_leiden(
  self,
  file_path: str,
  user_id: str,
  key: str,
  neighborsKey: str,
  resolution: float = 1
):
  
  start_progress(self)
  
  result: ComputationResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
  }
  
  with open_h5ad_write(file_path, user_id) as adata:
    
    try:
      key_observation = f"{key}"
      key_neighbors = f"{neighborsKey}"
      
      changes_made = handle_pipeline_steps(self, [
        PipelineStep("Computing Leiden clusters", partial(handle_leiden, adata, key_neighbors, key_observation, resolution)),
      ])
      
      end_progress(self)
      
      if changes_made:
        sc.write(file_path, adata)
      
      obs_data = adata.obs[key_observation].astype("category")
      labels = list(obs_data.cat.categories)
      label_map = list(obs_data.cat.codes)
      
      result["response"] = {
        "categories": labels,
        "codes": label_map
      }
      result["ok"] = True
      _finalize_task(self.request.id, user_id, "SUCCESS")
    
    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
      _finalize_task(self.request.id, user_id, "FAILURE", error=str(e))
  
  return result

# ============================================================================================
@celery_app.task(bind=True)
def compute_rgg(
  self,
  file_path: str,
  user_id: str,
  uns_key: str,
  n_genes: int,
  selected_genes: Optional[list[str]]
):
  
  start_progress(self)
  
  result: ComputationResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
  }
  
  with open_h5ad_write(file_path, user_id) as adata:
    
    try:
      key_cluster = f"{uns_key}"
      key_rgg = f"rank_genes_groups_{uns_key}"
      key_dendrogram = f"dendrogram_{uns_key}"
      key_dotplot = f"dotplot_stats_g{n_genes}_{'_'.join(selected_genes).lower() if (selected_genes != None) else ''}_{uns_key}"
    
      changes_made = handle_pipeline_steps(self, [
        PipelineStep(f"Computing gene-rankings from the clustering '{uns_key}'", partial(handle_rank_genes_groups, adata, key_cluster, key_rgg)),
        PipelineStep(f"Computing dendrogram", partial(handle_dendrogram, adata, key_cluster, key_dendrogram)),
        PipelineStep(f"Computing dotplot table", partial(handle_rgg_data_table, adata, key_cluster, key_dotplot, key_rgg, n_genes, selected_genes))
      ])
      
      end_progress(self)
      
      if changes_made:
        sc.write(file_path, adata)
      
      
      dendro_data = adata.uns[key_dendrogram]
      dendro_order = dendro_data["categories_ordered"]
      dendro_tree = build_dendrogram_tree(dendro_data["linkage"], dendro_order)
      
      dotplot_data = adata.uns[key_dotplot]
      data_sorted = sort_by_dendro_rgg_rbb_order(
        pd.DataFrame(dotplot_data["data"]),
        dendro_order,
        n_genes
      )
      
      result["response"] = {
        "table": data_sorted.to_dict(orient="records"),
        "n_genes": int(dotplot_data["n_genes"]),
        "n_clusters": int(len(dendro_order)),
        "dendro": json.dumps(make_safe(dendro_tree)),
      }
      result["ok"] = True
      
    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
  
  return result

@celery_app.task(bind=True)
def compute_save_file_as(
  self,
  file_path: str,
  user_id: str,
  new_file_path: str,
  selected_obs: str,
  selected_obs_clusters: list[str],
):
  
  simple_update_progress(self, "Opening AnnData object")
  
  result: ComputationResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
  }
  
  with open_h5ad_write(file_path, user_id) as adata:
      
    try:
      simple_update_progress(self, "Slicing object using selected clusters")

      adata_subset = adata[adata.obs[selected_obs].isin(selected_obs_clusters), :]
      
      simple_update_progress(self, "Saving slice as new file")
      
      sc.write(os.path.join(UPLOAD_DIR, new_file_path), adata_subset)
      
      result["response"] = "Slicing successful"
      result["ok"] = True
    
    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
  
  return result
  
# ============================================================================================
@celery_app.task(bind=True)
def compute_celltypist_annotations(
  self,
  file_path: str,
  user_id: str,
  key: str,
  connectivities_key: str,
  annotation_model: str = "Immune_All_Low.pkl",
):
  
  # TODO: Use connectivities_key to avoid having to recompute neigbours/connectivities for celltypist
  
  start_progress(self)
  
  result: ComputationResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
  }
  
  with open_h5ad_write(file_path, user_id) as adata:
    
    try:
      
      step_current = 0
      function_steps = [
        "Loading in specified model",
        "Predicting annotations",
        "Converting to anndata format"
        "Writing predictions to anndata object"
      ]
      
      update_progress(self, step_current, function_steps)
      model = ct.models.Model.load(model = annotation_model)
      
      keyStripped = connectivities_key.replace('_connectivities', '')
      
      adata.uns["neighbors"] = copy.deepcopy(adata.uns[keyStripped])
      adata.uns["neighbors"]["connectivities_key"] = "connectivities"
      adata.uns["neighbors"]["distances_key"] = "distances"
      
      adata.obsp["connectivities"] = adata.obsp[f"{connectivities_key}"].copy()
      adata.obsp["distances"] = adata.obsp[f"{connectivities_key.replace('_connectivities', '')}_distances"].copy()
      
      step_current += 1
      update_progress(self, step_current, function_steps)
      predictions = ct.annotate(adata, model = model, majority_voting = True)
      
      step_current += 1
      update_progress(self, step_current, function_steps)
      adata_with_preds = predictions.to_adata(prefix=key + "-")
  
      # labels = predictions.predicted_labels.to_dict(orient="records")
      
      step_current += 1
      update_progress(self, step_current, function_steps)
      sc.write(file_path, adata_with_preds)
      
      obs_data = adata.obs[f"{key}-majority_voting"].astype("category")
      labels = list(obs_data.cat.categories)
      label_map = list(obs_data.cat.codes)
      
      result["response"] = {
        "categories": labels,
        "codes": label_map
      }
      
      # result["response"] = {
      #   "labels": labels
      # }
      result["ok"] = True
    
    except Exception as e:
      
      logger.debug(["ERROR", e])
      
      errorMessage = f"OKAY Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
      
  return result
  
# ============================================================================================
@celery_app.task(bind=True)
def compute_recluster(
  self,
  file_path: str,
  user_id: str,
  observation_dict: dict
):
  
  
  start_progress(self)
  
  result: ComputationResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
  }
  
  with open_h5ad_write(file_path, user_id) as adata:

    try:
      observation = newObservation.model_validate(observation_dict)
      
      adata = sc.read_h5ad(file_path)
      
      obs_map = {
        sub: cluster.label
        for cluster in observation.clusters
        for sub in cluster.subclusters
      }
      
      obs_key = observation.name
      
      adata.obs[obs_key] = adata.obs[observation.base].replace(obs_map)
      adata.obs[obs_key] = adata.obs[obs_key].astype("category")

      end_progress(self)
      
      sc.write(file_path, adata)
      
      result["response"] = obs_key
      result["ok"] = True

    except Exception as e:
      errorMessage = f"Something unexpected happened: {e}"
      result["response"] = errorMessage
      result["ok"] = False
  
  return result

# ============================================================================================
@celery_app.task(bind=True)
def compute_merge_data(
  self,
  file_path: str,
  user_id: str,
  file_path_dest: str,
  observation_dict: dict
):
  
  start_progress(self)
  
  result: ComputationResponse = {
    "response": "Something went VERY wrong",
    "ok": False,
  }
  
  with open_h5ad_read(file_path, user_id) as adata_src:
    
    with open_h5ad_write(file_path_dest, user_id) as adata_dest:
      
      try:
        observation = newObservation.model_validate(observation_dict)
        
        obs_map = {
          sub: cluster.label
          for cluster in observation.clusters
          for sub in cluster.subclusters
        }
        
        obs_key = observation.name
        
        valid_source_levels: Set[str] = set(obs_map.keys())
        mask = adata_src[obs_key].isin(valid_source_levels)
        
        src_subset = adata_src[mask].copy()
        
        ad.concat(
          [adata_dest, src_subset],
          axis=0,
          join="inner",
          merge="same",
          label=None
        )
        
        end_progress(self)
      
        sc.write(file_path_dest, adata_dest)
        
        result["response"] = {
          "obs":  list(filter(notStartWith, adata_dest.obs_keys())),
          "var":  list(filter(notStartWith, adata_dest.var_keys())),
          "uns": make_safe(adata_dest.uns),
          "obsm": list(filter(notStartWith, adata_dest.obsm_keys())),
          "varm": list(filter(notStartWith, adata_dest.varm_keys())),
          "obsp": list(filter(notStartWith, list(adata_dest.obsp.keys()))),
        }
        result["ok"] = True

      except Exception as e:
        errorMessage = f"Something unexpected happened: {e}"
        result["response"] = errorMessage
        result["ok"] = False
      
      