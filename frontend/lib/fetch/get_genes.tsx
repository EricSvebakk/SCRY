import { setGenes } from "../redux/reducers/plotReducer";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

function get_genes(fileID: string, callback: Function) {
  const request = `${BACKEND_ENDPOINT}/get_genes?file_id=${fileID}`;

  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("something fucky happened");
      }
      return response.json();
    })
    .then((data) => {
      callback(setGenes(data));
    })
    .catch((error) => {
      console.error("something fucky", error);
    });
}