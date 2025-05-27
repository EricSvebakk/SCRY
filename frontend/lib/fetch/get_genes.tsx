import { setGenes, setInProgress } from "../redux/reducers/plotReducer";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_genes(fileID: string, callback: Function) {
  const request = `${BACKEND_ENDPOINT}/get_genes?file_id=${fileID}`;

  callback(setInProgress({
    type: "get_genes",
    value: true,
  }));
  
  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with get_genes()");
      }
      return response.json();
    })
    .then((data) => {
      callback(setGenes(data.genes));
      callback(setInProgress({
        type: "get_genes",
        value: false,
      }));
    })
    .catch((error) => {
      console.error("Something went wrong with get_genes()", error);
      callback(setInProgress({
        type: "get_genes",
        value: false,
      }));
    });
}