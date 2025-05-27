
import { setGenes, setInProgress } from "../redux/reducers/plotReducer";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_ranked_genes_groups(
  fileID: string,
  unsKey: string,
  callback: Function
) {
  
  const request = `${BACKEND_ENDPOINT}/get_ranked_genes_groups?file_id=${fileID}&uns_key=${unsKey}`;
  
  callback(setInProgress({
    type: "get_ranked_genes_groups",
    value: true,
  }));
  
  fetch(request)
  .then((response) => {
    if (!response.ok) {
      console.error("Something went wrong with get_ranked_genes_groups()");
    }
    return response.json();
  })
  .then((data) => {
    console.log(data);
    callback(setGenes(JSON.parse(data)));
    callback(setInProgress({
      type: "get_ranked_genes_groups",
      value: false,
    }));
  })
  .catch((error) => {
    console.error("Something went wrong with get_ranked_genes_groups()", error);
    callback(setInProgress({
      type: "get_ranked_genes_groups",
      value: false,
    }));
  })
}