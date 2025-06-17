
import os
from celery import Celery
import scanpy as sc
import pandas as pd
import json
from anndata_util import sort_by_dendro_rgg_rbb_order, get_dendro_tree, make_safe

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")

celery_app = Celery(
  "worker",
  broker=CELERY_BROKER_URL,
  backend=CELERY_BROKER_URL
)

print("URL", CELERY_BROKER_URL)
print(celery_app)

# ============================================================================================
def update_progress(task, step_index: int, steps: list[str]):
  total = len(steps)
  
  if (step_index >= 0) and (step_index < total):
    task.update_state(
      state="PROGRESS",
      meta={
        "current": step_index + 1,
        "total": total,
        "step": steps[step_index],
        "status": f"Step {step_index + 1}/{total}: {steps[step_index]}"
      }
    )

# ============================================================================================
@celery_app.task(bind=True)
def compute_ldr(
  self,
  file_path: str,
  n_pcs: int = 30,
):
  
  step_current = 0
  function_steps = [
    "Opening anndata object",
  ]
  
  update_progress(self, step_current, function_steps)
  
  adata = sc.read_h5ad(file_path)
  
  changes_made = False
  pca_key = f"X_pca"
  
  if (not (pca_key in adata.obsm_keys())) or (adata.obsm[pca_key].shape[1] < n_pcs):
    
    function_steps.append("Computing PCA")
    
    step_current += 1
    update_progress(self, step_current, function_steps)
    
    changes_made = True
    sc.pp.pca(
      adata,
      key_added=pca_key,
      n_comps=n_pcs,
    )
  
  if changes_made:
    
    function_steps.append("Storing results to anndata object")
    
    step_current += 1
    update_progress(self, step_current, function_steps)
    
    sc.write(file_path, adata)
  
  ldr_data = list(adata.obsm[pca_key][:, :2].tolist())
  
  adata.file.close()
  
  return {
    "changes": changes_made,
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
  
  step_current = 0
  function_steps = [
    "Opening anndata object",
  ]
  
  update_progress(self, step_current, function_steps)
  
  adata = sc.read_h5ad(file_path)
  
  changes_made = False
  neighbors_key = f"neighbors_{key}"
  umap_key = f"X_umap_{key}"
  pca_key = f"X_pca"

  if (not (pca_key in adata.obsm_keys())) or (adata.obsm[pca_key].shape[1] < n_pcs):
    
    if (adata.obsm[pca_key].shape[1] < n_pcs):
      pca_key = f"X_pca_{n_pcs}"
    
    function_steps.append("Computing PCA")
    
    step_current += 1
    update_progress(self, step_current, function_steps)
    
    changes_made = True
    sc.pp.pca(
      adata,
      key_added=pca_key,
      n_comps=n_pcs,
    )

  if not (neighbors_key in adata.uns_keys()):
    
    function_steps.append("Computing neighbors")
    
    step_current += 1
    update_progress(self, step_current, function_steps)
    
    changes_made = True
    sc.pp.neighbors(
      adata,
      key_added=neighbors_key,
      use_rep=pca_key,
      n_pcs=n_pcs,
      n_neighbors=n_neighbors
    )
  
  if not (umap_key in adata.obsm_keys()):
    
    function_steps.append("Computing UMAP")
    
    step_current += 1
    update_progress(self, step_current, function_steps)
    
    changes_made = True
    sc.tl.umap(
      adata,
      neighbors_key=neighbors_key,
      key_added=umap_key,
      min_dist=min_dist,
      spread=spread,
    )
  
  if changes_made:
    
    function_steps.append("Storing results to anndata object")
    
    step_current += 1
    update_progress(self, step_current, function_steps)
    
    sc.write(file_path, adata)
  
  obsm_data = list(adata.obsm[umap_key][:, :2].tolist())
  
  adata.file.close()
  
  return {
    "changes": changes_made,
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
  
  step_current = 0
  function_steps = [
    "Opening anndata object",
    "Computing leiden clusters",
    "Retrieving data",
    "Storing results to anndata object"
  ]
  
  update_progress(self, step_current, function_steps)
  
  adata = sc.read_h5ad(file_path)
  
  res_to_string = f"{resolution}".replace(".", "_")
  resolution_key = f"leiden_{res_to_string}_{key}"
  
  step_current += 1
  update_progress(self, step_current, function_steps)
  
  sc.tl.leiden(
    adata,
    neighbors_key=key,
    key_added=resolution_key,
    resolution=resolution,
    flavor="igraph"
  )
  
  step_current += 1
  update_progress(self, step_current, function_steps)
  
  obs_data = adata.obs[resolution_key].astype("category")
  labels = list(obs_data.cat.categories)
  label_map = list(obs_data.cat.codes)
  
  step_current += 1
  update_progress(self, step_current, function_steps)
  
  sc.write(file_path, adata)
  
  adata.file.close()
  
  return {
    "labels": labels,
    "label_map": label_map
  }
  
# ============================================================================================
@celery_app.task(bind=True)
def compute_ranked_genes_groups(
  self,
  file_path: str,
  key: str
):
  
  step_current = 0
  function_steps = [
    "Opening anndata object",
    "Computing leiden clusters",
    "Retrieving data",
    "Storing results to anndata object"
  ]
  
  update_progress(self, step_current, function_steps)
  
  adata = sc.read_h5ad(file_path)
  
  step_current += 1
  update_progress(self, step_current, function_steps)
  
  sc.tl.rank_genes_groups(
    adata,
    method="wilcoxon",
    groupby=key,
    key_added= "rank_genes_groups_" + key
  )
  
  step_current += 1
  update_progress(self, step_current, function_steps)
  
  sc.write(file_path, adata)
  
  return True

# ============================================================================================
@celery_app.task(bind=True)
def compute_rgg_dotplot(
  self,
  file_path: str,
  uns_key: str,
  n_genes: int,
):
  
  step_current = 0
  function_steps = [
    "Opening anndata object"
  ]
  
  update_progress(self, step_current, function_steps)
  
  adata = sc.read_h5ad(file_path)
  
  key_dotplot = f"dotplot_stats_g{n_genes}_{uns_key}"
  
  # Dotplot and dendrogram have already been generated
  if (key_dotplot in adata.uns_keys()):
    
    function_steps.append("Sort dataframe by dendrogram-rgg-rrb order")
    
    step_current += 1
    update_progress(self, step_current, function_steps)
    
    results = adata.uns[key_dotplot]
    dendro_order = adata.uns[f"dendrogram_{uns_key}"]["categories_ordered"]
    sorted_records = (
      sort_by_dendro_rgg_rbb_order(
        pd.DataFrame(results["data"]),
        dendro_order,
        n_genes
      )
      .to_dict(orient="records")
    )
    
    return {
      "data": sorted_records,
      "dendro": results["dendro"],
      "n_genes": int(results["n_genes"]),
      "n_clusters": int(len(dendro_order))
    }
    
  # Neither Dotplot or dendrogram have been generated
  
  function_steps.extend([
    "Compute sc.pl.rank_genes_groups_dotplot() for figure information",
    "Remove duplicate columns",
    "Convert dataframes to long-format",
    "Combine dataframes",
    "Retrieve pval, logfoldchange and rank from previous sc.tl.rank_genes_groups() computation and merge",
    "Filter out results with pval_adj < 0.05",
    "Store results to anndata object",
    "Sort dataframe by dendrogram-rgg-rrb order",
  ])
  
  step_current += 1
  update_progress(self, step_current, function_steps)
  
  key_rgg = f"rank_genes_groups_{uns_key}"
  
  fig = sc.pl.rank_genes_groups_dotplot(
    adata,
    key=key_rgg,
    n_genes=n_genes,
    return_fig=True
  )
  
  mean_expr_df = fig.dot_color_df
  frac_expr_df = fig.dot_size_df
  
  step_current += 1
  update_progress(self, step_current, function_steps)
  
  mean_expr_df_no_dup = mean_expr_df.loc[:, ~mean_expr_df.T.duplicated()]
  frac_expr_df_no_dup = frac_expr_df.loc[:, ~frac_expr_df.T.duplicated()]
  
  n_genes_actual = len(mean_expr_df_no_dup.columns)
  
  step_current += 1
  update_progress(self, step_current, function_steps)
  
  mean_expr_long = mean_expr_df_no_dup.reset_index().melt(id_vars="index", var_name="gene", value_name="mean_expr").rename(columns={"index": "cluster"})
  frac_expr_long = frac_expr_df_no_dup.reset_index().melt(id_vars="index", var_name="gene", value_name="frac_expr").rename(columns={"index": "cluster"})

  step_current += 1
  update_progress(self, step_current, function_steps)
  
  merged_expr = mean_expr_long.merge(frac_expr_long, on=["gene", "cluster"])
  
  # Get remaining data not provided by fig
  rgg = adata.uns[key_rgg]
  pvals = []
  logfcs = []
  ranks = []

  step_current += 1
  update_progress(self, step_current, function_steps)
  
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
  
  step_current += 1
  update_progress(self, step_current, function_steps)
  
  filtered_df = merged_expr[merged_expr["pvals_adj"] < 0.05]
  
  # Generate tree <3
  dendro_tree = get_dendro_tree(adata, uns_key)
  
  # Convert types for storing in anndata
  results = {
    "data": filtered_df.to_dict(orient="list"),
    "n_genes": int(n_genes_actual),
    "dendro": json.dumps(make_safe(dendro_tree))
  }
  
  step_current += 1
  update_progress(self, step_current, function_steps)
  
  adata.uns[key_dotplot] = results
  sc.write(file_path, adata)
  adata.file.close()    
  
  dendro_order = adata.uns[f"dendrogram_{uns_key}"]["categories_ordered"]
  
  step_current += 1
  update_progress(self, step_current, function_steps)
  
  sorted_records = (
    sort_by_dendro_rgg_rbb_order(
      pd.DataFrame(results["data"]),
      dendro_order,
      n_genes
    )
    .to_dict(orient="records")
  )
  
  return {
    "data": sorted_records,
    "dendro": results["dendro"],
    "n_genes": int(results["n_genes"]),
    "n_clusters": int(len(dendro_order)),
  }