import { setInProgress } from "../redux/reducers/plotReducer";
import { get_file_hierarchy } from "./get_file_hierarchy";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function generate_ranked_genes_groups(
  fileID: string,
  uns_key: string,
  callback: Function,
) {
  
  const request = `${BACKEND_ENDPOINT}/generate_ranked_genes_groups/`;
  
  const formData = new FormData();
  formData.append("file_id", fileID);
  formData.append("uns_key", uns_key);
  
  callback(setInProgress({
    type: "generate_ranked_genes_groups",
    value: true,
  }));
  
  fetch(request, {
    method: "POST",
    mode: "cors",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with generate_ranked_genes_groups(): not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("generate_ranked_genes_groups() result", data);
      callback(setInProgress({
        type: "generate_ranked_genes_groups",
        value: false,
      }));
      
      get_file_hierarchy(fileID, callback);
    })
    .catch((error) => {
      console.error("Something went wrong with generate_ranked_genes_groups()", error);
      callback(
        setInProgress({
          type: "generate_ranked_genes_groups",
          value: false,
        })
      );
    });
}