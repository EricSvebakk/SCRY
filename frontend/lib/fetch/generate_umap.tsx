import { setStatus } from "../redux/reducers/plotReducer";
import { get_file_hierarchy } from "./get_file_hierarchy";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function generate_umap(
  fileID: string,
  adataKey: string,
  numPCs: number,
  minDist: number,
  spread: number,
  nNeighbors: number,
  callback: Function
) {
  const request = `${BACKEND_ENDPOINT}/generate_umap/`;

  const formData = new FormData();
  formData.append("file_id", fileID);
  formData.append("adata_key", adataKey);
  formData.append("n_pcs", numPCs.toString());
  formData.append("min_dist", minDist.toString());
  formData.append("spread", spread.toString());
  formData.append("n_neighbors", nNeighbors.toString());

  callback(
    setStatus({
      type: "generate_umap",
      value: true,
    })
  );

  fetch(request, {
    method: "POST",
    mode: "cors",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with generate_umap(): not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("generate_umap() result", data);
      callback(
        setStatus({
          type: "generate_umap",
          value: false,
        })
      );

      get_file_hierarchy(fileID, callback);
    })
    .catch((error) => {
      console.error("Something went wrong with generate_umap()", error);
      callback(
        setStatus({
          type: "generate_umap",
          value: false,
        })
      );
    });
}