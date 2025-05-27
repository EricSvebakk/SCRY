
import anndata as ad
import scanpy as sc
import os
import numpy as np
import pandas as pd
from scipy.cluster.hierarchy import linkage, to_tree

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
  if ("X_pca" not in adata.obsm):    
    sc.pp.pca(
      adata,
      # key_added=f"X_pca_{adata_key}",
      # n_comps=n_pcs,
      chunked=True,
      # chunk_size=1000,
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

def get_rgg_dotplot(
  file_path: str,
  uns_key: str,
  n_genes: int = 10,
  # n_groups: int = 4,
):
  
  adata = sc.read_h5ad(file_path)
  
  top_genes = set()
  for group in adata.uns["rank_genes_groups"]["names"].dtype.names:
    top_genes.update(adata.uns["rank_genes_groups"]["names"][group][:n_genes])
  
  sc.tl.dendrogram(adata, groupby=uns_key)
  
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
  
  dendrogram_data = adata.uns[f"dendrogram_{uns_key}"]
  dendrogram_order = dendrogram_data["categories_ordered"]
  # n_groups = len(dendrogram_order)
    
  dendrogram_tree = build_dendrogram_tree(dendrogram_data["linkage"], dendrogram_order)
    
  # group_order = adata.uns[f"dendrogram_{uns_key}"]["categories_ordered"]
  # dendrogram = 
  
  
  dp = sc.pl.DotPlot(adata, groupby=uns_key, var_names=sorted(top_genes))
  
  mean_expr_df = dp.dot_color_df # mean expression
  frac_expr_df = dp.dot_size_df # fraction expression
  
  adata.file.close()
  
  mean_expr_df = mean_expr_df.loc[dendrogram_order]
  frac_expr_df = frac_expr_df.loc[dendrogram_order]
  
  combined_df = (
    mean_expr_df
    .stack()
    .to_frame("mean_expr")
    .join(frac_expr_df.stack().to_frame("frac_expr"))
    .reset_index()
    .rename(columns={"level_0": "group", "level_1": "gene"})
  )
  
  genes = combined_df.drop_duplicates("gene", keep="first")["gene"].head(n_genes)
  groups = combined_df.drop_duplicates("group", keep="first")["group"].head(n_groups)
  
  results_df = combined_df[combined_df["gene"].isin(genes) & combined_df["group"].isin(groups)]

  return {
    "data": results_df.to_dict(orient="records"),
    "dendro": dendrogram_tree
  }

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