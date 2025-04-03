
import os
import zarr

def get_zarr_file_hierarchy(file_path: str) -> dict[str, object]:
  
  if (not file_path.endswith(".zarr")):
    return None
  
  zarr_data = zarr.open(file_path, "r")

  zarr_obj = {
      group_key: list(
          zarr_data[group_key].keys()
          if isinstance(zarr_data[group_key], zarr.Group)
          else []
      )
      for group_key in zarr_data.keys()
  }
  
  zarr_obj["obs"] = list(filter(lambda x: isinstance(zarr_data.obs[x], zarr.Group), zarr_data.obs.keys()))
  
  return zarr_obj
  
def get_zarr_file_obs(file_path: str, obs: str) -> dict[str, object]:
  
  obs_path = os.path.join(file_path, "obs", obs)
  
  obs_path_exists = os.path.exists(obs_path)
  obs_dir_exists = os.path.isdir(obs_path)
  
  if (not obs_path_exists or not obs_dir_exists):
    return None
  
  obs_group = zarr.open_group(obs_path, "r")
  
  obs_data = {
    "labels": list(obs_group.categories),
    "label_map": obs_group.codes[:].tolist()
  }
  
  return obs_data

def get_zarr_file_obs(file_path: str, obs: str) -> dict[str, list]:
  
  return None