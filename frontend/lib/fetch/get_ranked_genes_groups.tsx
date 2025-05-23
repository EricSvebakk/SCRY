
import { setGenes } from "../redux/reducers/plotReducer";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_ranked_genes_groups(
  fileID: string,
  unsKey: string,
  callback: Function
) {
  
  const request = `${BACKEND_ENDPOINT}/get_ranked_genes_groups?file_id=${fileID}&uns_key=${unsKey}`;
  
  fetch(request)
  .then((response) => {
    if (!response.ok) {
      console.error("something fucky happened")
    }
    return response.json();
  })
  .then((data) => {
    console.log(data);
    callback(setGenes(JSON.parse(data)));
  })
  .catch((error) => {
    console.error("something fucky", error);
  })
}