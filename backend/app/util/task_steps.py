
from __future__ import annotations

import json
import copy

import celltypist as ct
import numpy as np
import anndata as ad

from scipy.cluster.hierarchy import to_tree
from anndata import AnnData
from typing import Optional, List, Dict, Tuple, Set
from pandas import Categorical, DataFrame
from redis import Redis

from my_types import newObservation
from util.context_manager import open_h5ad_read


# ============================================================================================
def make_safe(obj):
  if isinstance(obj, np.ndarray):
    return None
  elif isinstance(obj, DataFrame):
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

# ============================================================================================
def handle_dge_data(
  adata: AnnData,
  key_cluster: str,
  key_dotplot: str,
  key_rgg: str,
  key_dendrogram: str,
  n_genes: int,
  selected_genes: Optional[List[str]],
) -> bool:
  """
  Build a tidy data table for rank_genes_groups results and store it in `adata.uns[key_dotplot]`.

  Uses manual computation (groupby over `adata.to_df()`) to obtain:
    - mean_expr: mean expression per (cluster, gene)
    - frac_expr: fraction of expressing cells per (cluster, gene)

  Also attaches:
    - pvals_adj, logfoldchange, rgg_order (rank index) from `adata.uns[key_rgg]`
  """

  if key_rgg not in adata.uns:
    raise KeyError(f"{key_rgg!r} not found in adata.uns")

  if key_cluster not in adata.obs:
    raise KeyError(f"{key_cluster!r} not found in adata.obs")

  rgg = adata.uns[key_rgg]

  # Collect top n_genes per group (preserve order using dict.fromkeys)
  top_genes_ordered: List[str] = []
 
  for group in rgg["names"].dtype.names:
    top_genes_ordered.extend(list(rgg["names"][group][:n_genes]))

  top_genes_ordered = list(dict.fromkeys(top_genes_ordered))  # dedupe, keep order

  # Merge in any explicitly selected genes, preserving their order
  if selected_genes:
    for g in selected_genes:
      if g not in top_genes_ordered:
        top_genes_ordered.append(g)

  # Only keep genes that actually exist in the AnnData object
  valid_genes = [g for g in top_genes_ordered if g in adata.var_names]

  if len(valid_genes) == 0:
    # Nothing to do
    adata.uns[key_dotplot] = {
      "data": {},
      "n_genes": 0,
      "params": {
        "clustering": key_cluster,
        "n_top_genes": n_genes,
        "selected_genes": selected_genes,
      },
    }
    return True

  # Convert to DataFrame: cells x genes
  X_df = adata.to_df()[valid_genes]

  # Cluster labels
  clusters = adata.obs[key_cluster]

  # Attach cluster labels and group
  expr_with_cluster = X_df.join(clusters)

  # Mean expression per cluster x gene
  mean_expr_df = (
    expr_with_cluster
    .groupby(key_cluster)[valid_genes]
    .mean()
  )

  # Fraction of cells expressing gene (> 0) per cluster x gene
  binary_expr = (expr_with_cluster[valid_genes] > 0)
  binary_expr[key_cluster] = clusters.values

  frac_expr_df = (
    binary_expr
    .groupby(key_cluster)[valid_genes]
    .mean()
    .astype(float)
  )

  n_genes_present = mean_expr_df.shape[1]

  mean_expr_long = (
    mean_expr_df
    .reset_index()
    .melt(
      id_vars=key_cluster,
      var_name="gene",
      value_name="mean_expr",
    )
    .rename(columns={key_cluster: "cluster"})
  )

  frac_expr_long = (
    frac_expr_df
    .reset_index()
    .melt(
      id_vars=key_cluster,
      var_name="gene",
      value_name="frac_expr",
    )
    .rename(columns={key_cluster: "cluster"})
  )

  merged_expr = mean_expr_long.merge(
    frac_expr_long,
    on=["cluster", "gene"],
    how="inner",
  )

  # Build fast lookup: stats_by_group[group][gene] = (pval_adj, logfc, rank_idx)
  stats_by_group: Dict[str, Dict[str, Tuple[float, float, int]]] = {}

  group_names = rgg["names"].dtype.names
  for group in group_names:
   
    names = list(rgg["names"][group])
    pvals_adj = rgg["pvals_adj"][group]
    logfcs = rgg["logfoldchanges"][group]

    per_gene: Dict[str, Tuple[float, float, int]] = {}
    
    for index, gene in enumerate(names):
      per_gene[gene] = (float(pvals_adj[index]), float(logfcs[index]), int(index))

    stats_by_group[str(group)] = per_gene

  pvals_adj_list: List[float] = []
  logfc_list: List[float] = []
  rank_list: List[float] = []
  
  # Traverse and store additional data as columns
  for cluster, gene in zip(merged_expr["cluster"], merged_expr["gene"]):
    
    group_stats = stats_by_group.get(str(cluster))
    
    if group_stats is None:
      pvals_adj_list.append(np.nan)
      logfc_list.append(np.nan)
      rank_list.append(np.nan)
      continue

    stats = group_stats.get(gene)
    
    if stats is None:
      pvals_adj_list.append(np.nan)
      logfc_list.append(np.nan)
      rank_list.append(np.nan)
    
    else:
      pval, logfc, rank = stats
      pvals_adj_list.append(pval)
      logfc_list.append(logfc)
      rank_list.append(rank)

  merged_expr["pvals_adj"] = pvals_adj_list
  merged_expr["logfoldchange"] = logfc_list
  merged_expr["rgg_order"] = rank_list

  # Filter by adjusted p-value and store in adata.uns
  mask_valid_p = merged_expr["pvals_adj"].notna()
  filtered_df = merged_expr[mask_valid_p & (merged_expr["pvals_adj"] < 0.05)]

  dendro = adata.uns[key_dendrogram]
  dendro_order = dendro["categories_ordered"]
  dendro_tree = build_dendrogram_tree(dendro["linkage"], dendro_order)

  sorted_df = (
    filtered_df
    # 1) cluster order by dendrogram, then rgg_order
    .assign(
      cluster_cat=Categorical(
        filtered_df["cluster"],
        categories=dendro_order,
        ordered=True,
      )
    )
    .assign(dendro_order=lambda x: x["cluster_cat"].cat.codes)
    .sort_values(by=["dendro_order", "rgg_order"])
    
    # 2) round-robin batching across clusters
    .assign(
      within_cluster_rank=lambda x: x.groupby("cluster").cumcount(),
      batch=lambda x: x["within_cluster_rank"] // n_genes,
    )
    .sort_values(by=["batch", "dendro_order", "rgg_order"])
    .drop(columns=[
      "cluster_cat",
      "dendro_order",
      "within_cluster_rank",
      "batch"
    ]) # remove helper columns
    .reset_index(drop=True)
  )

  adata.uns[key_dotplot] = {
    "table": sorted_df.to_dict(orient="list"),
    "dendro": json.dumps(make_safe(dendro_tree)),
    "n_genes": int(n_genes_present),
    "n_clusters": int(len(dendro_order)),
    "params": {
      "clustering": key_cluster,
      "n_top_genes": int(n_genes),
      "selected_genes": selected_genes,
    },
  }

  return True

# ============================================================================================
def handle_annotation(
  adata: AnnData,
  obs_prefix: str,
  connectivities_key: str,
  annotation_model: str
) -> bool:
  
  key_stripped = connectivities_key.replace('_connectivities', '')
  
  # Load models
  model = ct.models.Model.load(model = annotation_model)
  
  # Backup metadata
  prev_neighbors = adata.uns.get("neighbors", None)
  prev_connectivities = adata.obsp.get("connectivities", None)
  prev_distances = adata.obsp.get("distances", None)
  
  try:
    # Move metadata to adhere to CellTypist expectations
    adata.uns["neighbors"] = copy.deepcopy(adata.uns[key_stripped])
    adata.uns["neighbors"]["connectivities_key"] = "connectivities"
    adata.uns["neighbors"]["distances_key"] = "distances"
    
    adata.obsp["connectivities"] = adata.obsp[f"{connectivities_key}"].copy()
    adata.obsp["distances"] = adata.obsp[f"{connectivities_key.replace('_connectivities', '')}_distances"].copy()
    
    # Compute predictions
    predictions = ct.annotate(adata, model = model, majority_voting = True)    
    
    # Create prefix keys
    obs_prefix_pl = f"{obs_prefix}_predicted_labels"
    obs_prefix_mv = f"{obs_prefix}_majority_voting"
    obs_prefix_cs = f"{obs_prefix}_conf_score"
    
    pred_adata = predictions.to_adata()
    
    # Store predictions
    adata.obs[obs_prefix_pl] = pred_adata.obs["predicted_labels"].copy()
    adata.obs[obs_prefix_mv] = pred_adata.obs["majority_voting"].copy()
    adata.obs[obs_prefix_cs] = pred_adata.obs["conf_score"].copy()
    
    # Store metadata
    adata.uns[f"celltypist_metadata_{obs_prefix}"] = {
      "model": annotation_model,
      "obs_keys": {
        "predicted_labels": obs_prefix_pl,
        "majority_voting": obs_prefix_mv,
        "conf_score": obs_prefix_cs,
      },
      "params": {
        "majority_voting": True,
      }
    }
  
  # Restore metadata backup
  finally:
    if prev_neighbors is None:
      adata.uns.pop("neighbors", None)
    else:
      adata.uns["neighbors"] = prev_neighbors

    if prev_connectivities is None:
      adata.obsp.pop("connectivities", None)
    else:
      adata.obsp["connectivities"] = prev_connectivities

    if prev_distances is None:
      adata.obsp.pop("distances", None)
    else:
      adata.obsp["distances"] = prev_distances
  
  return True

# ============================================================================================
def handle_reclustering(
  adata: AnnData,
  observation_dict: dict
) -> bool:
  
  observation = newObservation.model_validate(observation_dict)
  
  obs_map = {
    sub: cluster.label
    for cluster in observation.clusters
    for sub in cluster.subclusters
  }
  
  obs_key = observation.name
  
  adata.obs[obs_key] = adata.obs[observation.base].replace(obs_map)
  adata.obs[obs_key] = adata.obs[obs_key].astype("category")
  
  return True

# ============================================================================================
def handle_merging(
  adata_dest: AnnData,
  file_path_src: str,
  observation_dict: dict,
  r: Redis,
  user_id: str,
):
  
  observation = newObservation.model_validate(observation_dict)
  
  obs_map = {
    sub: cluster.label
    for cluster in observation.clusters
    for sub in cluster.subclusters
  }
  
  obs_key = observation.name
  
  valid_source_levels: Set[str] = set(obs_map.keys())
  mask = adata_dest[obs_key].isin(valid_source_levels)
  
  subset_dest = adata_dest[mask].copy()
  
  with open_h5ad_read(r, file_path_src, user_id) as adata_src:

    ad.concat(
      [adata_src, subset_dest],
      axis=0,
      join="inner",
      merge="same",
      label=None
    )
  
  return True
  
  