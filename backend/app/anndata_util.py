
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
  
  obs_data = adata.obs[selectedObs].astype("category")
  
  labels = list(obs_data.cat.categories)
  label_map = list(obs_data.cat.codes)
  
  adata.file.close()
  
  return {
    "labels": labels,
    "label_map": label_map
  }
  
def get_anndata_file_obsm(file_path: str, selectedObsm: str) -> dict[str, object]:
  
  adata = sc.read_h5ad(file_path, backed="r")
  
  try:
    obsm_data = list(adata.obsm[selectedObsm][:, :2].tolist())
    
    adata.file.close()
    
    return {
      "coordinates": obsm_data
    }
  
  except:
    return -1

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
  
  result = adata.uns["rank_genes_groups"]
  groups = result["names"].dtype.names
  
  all_results = {}

  for group_key in groups:
    all_results[group_key] = {
      'names': result['names'][group_key][:num_results].tolist(),
      'scores': result['scores'][group_key][:num_results].tolist(),
      'logfoldchanges': result['logfoldchanges'][group_key][:num_results].tolist(),
      'pvals': result['pvals'][group_key][:num_results].tolist(),
      'pvals_adj': result['pvals_adj'][group_key][:num_results].tolist(),
    }
  
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