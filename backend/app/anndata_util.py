
import anndata as ad
import scanpy as sc
import os
import numpy as np
import pandas as pd
from scipy.cluster.hierarchy import linkage, to_tree
from anndata import AnnData
import json

def get_anndata_file_hierarchy(file_path: str) -> dict[str, object]:
  
  if (not file_path.endswith(".h5ad")):
    return -1
  
  adata = sc.read_h5ad(file_path, backed="r")
  # adata = ad.read_h5ad(file_path, "r")
  
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
  
  return {
    "obs":  list(filter(notStartWith, adata.obs_keys())),
    "var":  list(filter(notStartWith, adata.var_keys())),
    "obsm": list(filter(notStartWith, adata.obsm_keys())),
    "obsp": list(filter(notStartWith, list(adata.obsp.keys()))),
    "varm": list(filter(notStartWith, adata.varm_keys())),
    "uns": list(filter(notStartWith, adata.uns_keys())),
    "uns": make_safe(adata.uns),
  }

def get_genes_h5ad(file_path: str):
  
  adata = sc.read_h5ad(file_path, backed="r")
  
  genes = list(adata.var_names)
  
  adata.file.close()
  
  return {
    "genes": genes
  }
    
  

def get_anndata_file_obs(file_path: str, selectedObs: str) -> dict[str, object]:
  
  adata = sc.read_h5ad(file_path, backed="r")
  
  # try:
  obs_data = adata.obs[selectedObs].astype("category")
  
  # print(type(obs_data), obs_data)
  # print()
  labels = list(obs_data.cat.categories)
  label_map = list(obs_data.cat.codes)
  
  adata.file.close()
  
  return {
    "labels": labels,
    "label_map": label_map
  }
  
  # except ValueError:
  #   print()
  #   return -1
  

def get_anndata_file_obsm(file_path: str, selectedObsm: str) -> dict[str, object]:
  
  adata = sc.read_h5ad(file_path, backed="r")
  
  try:
    obsm_data = list(adata.obsm[selectedObsm].tolist())
    
    adata.file.close()
    
    return {
      "coordinates": obsm_data
    }
  
  except:
    return -1

def generate_umap_h5ad(
  file_path: str,
  key: str,
  n_pcs: int = 30,
  min_dist: float = 0.5,
  spread: float = 1.0,
  n_neighbors: int = 15,
):
  
  adata = sc.read_h5ad(file_path)
  
  # Adds X_pca_[adata_key] to obsm, varm and uns
  if ("X_pca" not in adata.obsm_keys()):
    sc.pp.pca(
      adata,
      # key_added=f"X_pca_{adata_key}",
      # n_comps=n_pcs,
      chunked=True,
      chunk_size=1000,
      # zero_center=True,
      # svd_solver='arpack',
    )

  # stores [adata_key]_distances and [adata_key]_connectivities to obsp
  # stores [adata_key] to uns
  sc.pp.neighbors(
    adata,
    key_added=key,
    # use_rep=f"X_pca_{adata_key}",
    n_pcs=n_pcs,
    n_neighbors=n_neighbors
  )
  
  # Adds X_umap_[adata_key] to obsm and uns
  sc.tl.umap(
    adata,
    neighbors_key=key,
    key_added=f"X_umap_{key}",
    min_dist=min_dist,
    spread=spread,
  )
  
  # leiden_resolutions = {
  #   adata_key + "_leiden_res0_25": 0.25,
  #   adata_key + "_leiden_res0_5": 0.5,
  #   adata_key + "_leiden_res1": 1,
  # }
  
  # Stores leiden_resolutions[key] to obs and uns
  # for key in leiden_resolutions:
  #   sc.tl.leiden(adata, neighbors_key=adata_key, key_added=key, resolution=leiden_resolutions[key], flavor="igraph")
  
  sc.write(file_path, adata)
  
  adata.file.close()
  
  return os.path.exists(file_path)

def generate_leiden_h5ad(file_path: str, key: str, resolution: float = 1):
  
  adata = sc.read_h5ad(file_path)
  
  res_to_string = f"{resolution}".replace(".", "_")
  resolution_key = f"leiden_{res_to_string}_{key}"
  
  print(file_path, resolution_key, key, resolution)
  
  # Stores leiden_resolutions[key] to obs and uns
  sc.tl.leiden(
    adata,
    neighbors_key=key,
    key_added=resolution_key,
    resolution=resolution,
    flavor="igraph"
  )
  
  sc.write(file_path, adata)
  
  adata.file.close()
  
  return os.path.exists(file_path)

def generate_ranked_genes_groups(file_path: str, key: str):
  
  adata = sc.read_h5ad(file_path)
  
  sc.tl.rank_genes_groups(
    adata,
    method="wilcoxon",
    # pval
    groupby=key,
    key_added= "rank_genes_groups_" + key
  )
  
  sc.write(file_path, adata)
  
  adata.file.close()
  
  return os.path.exists(file_path)

def get_ranked_genes_groups(file_path: str, num_results: int = 20):
  
  adata = sc.read_h5ad(file_path)
  
  # result = adata.uns["rank_genes_groups"].keys()
  
  result = adata.uns["rank_genes_groups"]
  groups = result["names"].dtype.names
  # groups = result["names"].dtype.names
  
  all_results = {}

  for group_key in groups:
    all_results[group_key] = {
      'names': result['names'][group_key][:num_results].tolist(),
      'scores': result['scores'][group_key][:num_results].tolist(),
      'logfoldchanges': result['logfoldchanges'][group_key][:num_results].tolist(),
      'pvals': result['pvals'][group_key][:num_results].tolist(),
      'pvals_adj': result['pvals_adj'][group_key][:num_results].tolist(),
    }
  
  # return {
  #   'names': result['names'][group_key][:num_results].tolist(),
  #   'scores': result['scores'][group_key][:num_results].tolist(),
  #   'logfoldchanges': result['logfoldchanges'][group_key][:num_results].tolist(),
  #   'pvals': result['pvals'][group_key][:num_results].tolist(),
  #   'pvals_adj': result['pvals_adj'][group_key][:num_results].tolist(),
  # }
  
  # groups = result["names"].dtype.names
  
  # print(result)
  # print(groups)
  
  # sc.tl.rank_genes_groups(adata, groupby=key)
  
  # sc.write(file_path, adata)
  
  adata.file.close()
  
  return all_results

def build_dendrogram_tree(linkage_matrix, labels: list[str]):
  
  tree, nodes = to_tree(linkage_matrix, rd=True)
  
  def add_node(node):
    if node.is_leaf():
      return {"name": node.id}
    else:
      return {
        "name": None,
        "children": [add_node(node.left), add_node(node.right)],
        "distance": node.dist  # Optional: include distance info
      }

  return add_node(tree)


def get_dendro_tree(adata: AnnData, uns_key: str):
  """
  DOES NOT CLOSE ANNDATA
  """
  
  key_dendro = f"dendrogram_{uns_key}"
  
  # checks if dendrogram is already computed
  if (not key_dendro in adata.uns_keys()):
    sc.tl.dendrogram(adata, groupby=uns_key)
  
  dendro_data = adata.uns[key_dendro]   
  dendro_tree = build_dendrogram_tree(dendro_data["linkage"], dendro_data["categories_ordered"])
  
  return dendro_tree

def sort_by_dendro_rgg_rbb_order(df: pd.DataFrame, dendro_order: list[str], n_genes: int):
  
  # Sorts dataframe by dendro-order, then by rgg-order
  sorted_df = (
    df
    .assign(dendro_order=pd.Categorical(df["cluster"], categories=dendro_order, ordered=True))
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

def get_rgg_dotplot(
  file_path: str,
  uns_key: str,
  n_genes: int = 1,
):
  
  adata = sc.read_h5ad(file_path)
  
  key_dotplot = f"dotplot_stats_g{n_genes}_{uns_key}"
  
  # Dotplot and dendrogram have already been generated
  if (key_dotplot in adata.uns_keys()):
    
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
      "dendro": json.loads(results["dendro"]),
      "n_genes": int(results["n_genes"]),
      "n_clusters": int(len(dendro_order))
    }
  
  # Neither Dotplot or dendrogram have been generated
  key_rgg = f"rank_genes_groups_{uns_key}"
  
  # Coompute rgg dataframes
  fig = sc.pl.rank_genes_groups_dotplot(
    adata,
    key=key_rgg,
    n_genes=n_genes,
    return_fig=True
  )
  
  mean_expr_df = fig.dot_color_df
  frac_expr_df = fig.dot_size_df
  
  # Remove duplicate columns from n_genes > 1
  mean_expr_df_no_dup = mean_expr_df.loc[:, ~mean_expr_df.T.duplicated()]
  frac_expr_df_no_dup = frac_expr_df.loc[:, ~frac_expr_df.T.duplicated()]
  
  n_genes_actual = len(mean_expr_df_no_dup.columns)
  
  # Convert dfs to long-format
  mean_expr_long = mean_expr_df_no_dup.reset_index().melt(id_vars="index", var_name="gene", value_name="mean_expr").rename(columns={"index": "cluster"})
  frac_expr_long = frac_expr_df_no_dup.reset_index().melt(id_vars="index", var_name="gene", value_name="frac_expr").rename(columns={"index": "cluster"})

  # Combine dataframes
  merged_expr = mean_expr_long.merge(frac_expr_long, on=["gene", "cluster"])
  
  # Get remaining data not provided by fig
  rgg = adata.uns[key_rgg]
  pvals = []
  logfcs = []
  ranks = []

  # Generates lists for pvals, logfolds and rank to match longform-df
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
  
  # Add corresponding results to longform-df
  merged_expr["pvals_adj"] = pvals
  merged_expr["logfoldchange"] = logfcs
  merged_expr["rgg_order"] = ranks
  
  # Remove insignificant pval results
  filtered_df = merged_expr[merged_expr["pvals_adj"] < 0.05]
  
  # Generate tree <3
  dendro_tree = get_dendro_tree(adata, uns_key)
  
  # Convert types for storing in anndata
  results = {
    "data": filtered_df.to_dict(orient="list"),
    "n_genes": int(n_genes_actual),
    "dendro": json.dumps(make_safe(dendro_tree))
  }
  
  # Store computed results
  adata.uns[key_dotplot] = results
  sc.write(file_path, adata)
  adata.file.close()    
  
  dendro_order = adata.uns[f"dendrogram_{uns_key}"]["categories_ordered"]
  
  # Sort results based on dendrogram-rgg-rbb-order, similar to scanpy's rgg_dotplot
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
    "dendro": json.loads(results["dendro"]),
    "n_genes": int(results["n_genes"]),
    "n_clusters": int(len(dendro_order)),
  }

# Serialize object
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