
import os
from celery import Celery
import scanpy as sc
import pandas as pd
import celltypist as ct
import json
from typing import Optional
from anndata import AnnData

from dataclasses import dataclass
from functools import partial
from typing import Callable

from anndata_util import sort_by_dendro_rgg_rbb_order, make_safe, build_dendrogram_tree

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")

celery_app = Celery(
  "worker",
  broker=CELERY_BROKER_URL,
  backend=CELERY_BROKER_URL
)

print("URL", CELERY_BROKER_URL)
print(celery_app)

@dataclass
class PipelineStep:
  description: str
  func: Callable[[], bool]


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

# ============================================================================================
def handle_pipeline_steps(task, pipeline_steps: list[PipelineStep]):
  
  changes_made = False
  step_current = 0
  
  pipeline_description_steps = [x.description for x in pipeline_steps]

  for step in pipeline_steps:
    
    print(step.description)
    
    # # If it is the last step but no changes are made, ignore the last step
    # if (step_current == len(pipeline_steps) - 1) and not changes_made:
    #   break
    
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

def handle_leiden(adata: AnnData, key_neighbors: str, key_resolution: str, resolution: float) -> bool:
  
  changes_made = False
  
  if not (key_resolution in adata.obsm_keys()):
    
    changes_made = True
    sc.tl.leiden(
      adata,
      neighbors_key=key_neighbors,
      key_added=key_resolution,
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
  
def handle_dendrogram(adata: AnnData, key_cluster: str, key_dendrogram: str) -> bool:
  
  changes_made = False
  
  if not (key_dendrogram in adata.uns_keys()):
  
    changes_made = True
    sc.tl.dendrogram(adata, groupby=key_cluster, key_added=key_dendrogram)
    
  return changes_made

def handle_rgg_data_table(adata: AnnData, key_dotplot: str, key_rgg: str, n_genes: int) -> bool:
  
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
    "genes_present": int(n_genes_present),
  }
  
  return True

def handle_annotation():
  pass

# ============================================================================================
@celery_app.task(bind=True)
def compute_ldr(
  self,
  file_path: str,
  n_pcs: int = 30,
):
  
  start_progress(self)
  
  adata = sc.read_h5ad(file_path)
  
  key_pca = "X_pca"
  
  changes_made = handle_pipeline_steps(self, [
    PipelineStep("Computing PCA", partial(handle_pca, adata, key_pca, n_pcs)),
  ])
  
  end_progress(self)
  
  if (changes_made):
    sc.write(file_path, adata)
  
  ldr_data = list(adata.obsm[key_pca][:, :2].tolist())
  
  adata.file.close()
  
  return {
    # "changes": changes_made,
    "data": ldr_data,
  }

# ============================================================================================
@celery_app.task(bind=True)
def compute_nldr(
  self,
  file_path: str,
  key: str,
  n_pcs: int = 30,
  min_dist: float = 0.5,
  spread: float = 1.0,
  n_neighbors: int = 15,
):
  
  start_progress(self)
  
  adata = sc.read_h5ad(file_path)
  
  key_pca = "X_pca"
  key_neighbors = f"{key}"
  key_umap = f"X_umap_{key}"
  
  changes_made = handle_pipeline_steps(self, [
    PipelineStep("Computing PCA", partial(handle_pca, adata, key_pca, n_pcs)),
    PipelineStep("Computing neighbors distance matrix", partial(handle_neighbors, adata, key_neighbors, key_pca, n_pcs, n_neighbors)),
    PipelineStep("Computing UMAP", partial(handle_umap, adata, key_umap, key_neighbors, min_dist, spread)),
  ])
  
  end_progress(self)
  
  if changes_made:
    sc.write(file_path, adata)
  
  obsm_data = list(adata.obsm[key_umap][:, :2].tolist())
  
  adata.file.close()
  
  return {
    # "changes": changes_made,
    "data": obsm_data,
  }
  
# ============================================================================================
@celery_app.task(bind=True)
def compute_clustering(
  self,
  file_path: str,
  key: str,
  resolution: float = 1
):
  
  start_progress(self)
  
  adata = sc.read_h5ad(file_path)
  
  res_to_string = f"{resolution}".replace(".", "_")
  key_resolution = f"leiden_{res_to_string}_{key}"
  key_neighbors = f"{key}"
  
  changes_made = handle_pipeline_steps(self, [
    PipelineStep("Computing Leiden clusters", partial(handle_leiden, adata, key_neighbors, key_resolution, resolution)),
  ])
  
  end_progress(self)
  
  if changes_made:
    sc.write(file_path, adata)
  
  obs_data = adata.obs[key_resolution].astype("category")
  labels = list(obs_data.cat.categories)
  label_map = list(obs_data.cat.codes)
  
  adata.file.close()
  
  return {
    "labels": labels,
    "label_map": label_map
  }

# ============================================================================================
@celery_app.task(bind=True)
def compute_rgg_dotplot(
  self,
  file_path: str,
  uns_key: str,
  n_genes: int,
  selected_genes: Optional[list[str]]
):
  
  start_progress(self)
  
  adata = sc.read_h5ad(file_path)
  
  key_cluster = f"{uns_key}"
  key_rgg = f"rank_genes_groups_{uns_key}"
  key_dendrogram = f"dendrogram_{uns_key}"
  key_dotplot = f"dotplot_stats_g{n_genes}_{'_'.join(selected_genes).lower() if (selected_genes != None) else ''}_{uns_key}"
  
  
  changes_made = handle_pipeline_steps(self, [
    PipelineStep(f"Computing gene-rankings from the clustering '{uns_key}'", partial(handle_rank_genes_groups, adata, key_cluster, key_rgg)),
    PipelineStep(f"Computing dendrogram", partial(handle_dendrogram, adata, key_cluster, key_dendrogram)),
    PipelineStep(f"Computing dotplot table", partial(handle_rgg_data_table, adata, key_dotplot, key_rgg, n_genes))
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
  
  results = {
    "data": data_sorted.to_dict(orient="records"),
    "n_genes": int(dotplot_data["genes_present"]),
    "n_clusters": int(len(dendro_order)),
    "dendro": json.dumps(make_safe(dendro_tree)),
  }
  
  adata.file.close()  
  
  return results
  
# ============================================================================================
@celery_app.task(bind=True)
def compute_celltypist_annotations(
  self,
  file_path: str,
  key: str,
  connectivities_key: str,
  annotation_model: str = "Immune_All_Low.pkl",
):
  
  # TODO: FINISH REFACTORING OF FUNCTION TO USR PIPELINE-STRUCTURE
  
  # start_progress(self)
  
  # adata = sc.read_h5ad(file_path)

  # key_prefix = f"{key}_"

  
  # changes_made = handle_pipeline_steps(self, [
  #   PipelineStep("Predicting annotations", partial(handle_annotation, adata, annotation_model, key_prefix))
  #   # PipelineStep(f"Computing gene-rankings from the clustering '{uns_key}'", partial(handle_rank_genes_groups, adata, key_cluster, key_rgg)),
  #   # PipelineStep(f"Computing dendrogram", partial(handle_dendrogram, adata, key_cluster, key_dendrogram)),
  #   # PipelineStep(f"Computing dotplot table", partial(handle_rgg_data_table, adata, key_dotplot, key_rgg, n_genes))
  # ])
  
  # end_progress(self)
  
  # if changes_made:
  #   sc.write(file_path, adata)
  
  step_current = 0
  function_steps = [
    "Loading anndata object",
    "Loading in specified model",
    "Predicting annotations",
    "Converting to anndata format"
    "Writing predictions to anndata object"
  ]
  
  update_progress(self, step_current, function_steps)
  
  adata = sc.read_h5ad(file_path)
  
  # TODO: Use connectivities_key to avoid having to recompute neigbours/connectivities for celltypist
  # adata.obsp["connectivities"] = adata.obsp[connectivities_key]
  
  update_progress(self, step_current, function_steps)
  
  model = ct.models.Model.load(model = annotation_model)
  
  update_progress(self, step_current, function_steps)
  
  predictions = ct.annotate(adata, model = model, majority_voting = True)
  
  adata.file.close()
  
  update_progress(self, step_current, function_steps)
  
  adata_with_preds = predictions.to_adata(prefix=key + "_")
  
  labels = predictions.predicted_labels.to_dict(orient="records")
  
  update_progress(self, step_current, function_steps)
  
  sc.write(file_path, adata_with_preds)
  
  adata_with_preds.file.close()
  
  return {
    "labels": labels
  }
  
  