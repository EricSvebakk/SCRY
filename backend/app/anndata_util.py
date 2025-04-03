
import anndata as ad
import scanpy as sc

def get_anndata_file_hierarchy(file_path: str) -> dict[str, object]:
  
  if (not file_path.endswith(".h5ad")):
    return -1
  
  adata = sc.read_h5ad(file_path, backed="r")
  # adata = ad.read_h5ad(file_path, "r")
  
  return {
    "obs": adata.obs_keys(),
    "var": adata.var_keys(),
    "obsm": adata.obsm_keys(),
    "varm": adata.varm_keys(),
  }

def get_anndata_file_obs(file_path: str, selectedObs: str) -> dict[str, object]:
  
  adata = sc.read_h5ad(file_path, backed="r")
  
  # try:
  obs_data = adata.obs[selectedObs].astype("category")
  
  # print(type(obs_data), obs_data)
  # print()
  
  return {
    "labels": list(obs_data.cat.categories),
    "label_map": list(obs_data.cat.codes)
  }
  
  # except ValueError:
  #   print()
  #   return -1
  

def get_anndata_file_obsm(file_path: str, selectedObsm: str) -> dict[str, object]:
  
  adata = sc.read_h5ad(file_path, backed="r")
  
  try:
    obsm_data = adata.obsm[selectedObsm]
    # print(type(obsm_data), obsm_data)
    return {
      "coordinates": obsm_data.tolist()
    }
  
  except:
    return -1
