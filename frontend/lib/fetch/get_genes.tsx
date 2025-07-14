import { setGenes, setStatus } from "../redux/reducers/plotReducer";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_genes(fileID: string, dispatch: Function) {
  const request = `${BACKEND_ENDPOINT}/get_genes?file_id=${fileID}`;

  dispatch(
    setStatus({
      type: "get_genes",
      value: true,
      message: "Loading in AnnData genes",
    })
  );
  
  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with get_genes()");
      }
      return response.json();
    })
    .then((data) => {
      dispatch(setGenes(data.genes));
      dispatch(setStatus({
        type: "get_genes",
        value: false,
      }));
    })
    .catch((error) => {
      console.error("Something went wrong with get_genes()", error);
      dispatch(setStatus({
        type: "get_genes",
        value: false,
      }));
    });
}