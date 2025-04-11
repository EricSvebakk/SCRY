
import anndata as ad
import scanpy as sc
import os
import numpy as np

def get_anndata_file_hierarchy(file_path: str) -> dict[str, object]:
  
  if (not file_path.endswith(".h5ad")):
    return -1
  
  adata = sc.read_h5ad(file_path, backed="r")
  # adata = ad.read_h5ad(file_path, "r")
  
  def notStartWith(s1: str):
    return not s1.startswith("_")
  
  return {
    "obs":  list(filter(notStartWith, adata.obs_keys())),
    "var":  list(filter(notStartWith, adata.var_keys())),
    "obsm": list(filter(notStartWith, adata.obsm_keys())),
    "varm": list(filter(notStartWith, adata.varm_keys())),
    "uns": list(filter(notStartWith, adata.uns_keys())),
  }

def get_genes_h5ad(file_path: str):
  
  adata = sc.read_h5ad(file_path)
  
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
      chunk_size=1000,
      zero_center=True,
      svd_solver='arpack',
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
  resolution_key = f"{key}_leiden_{res_to_string}"
  
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