

import { setGeneExpression, setInProgress } from "../redux/reducers/plotReducer";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_rgg_dotplot(
  fileID: string,
  unsKey: string,
  nGenes: number,
  nGroups: number,
  callback: Function
) {
  
  const request = `${BACKEND_ENDPOINT}/get_rgg_dotplot?file_id=${fileID}&uns_key=${unsKey}&n_genes=${nGenes}&n_groups=${nGroups}`;
  
  callback(setInProgress({
    type: "get_rgg_dotplot",
    value: true,
  }));
  
  fetch(request)
  .then((response) => {
    if (!response.ok) {
      console.error("something fucky happened")
    }
    return response.json();
  })
  .then((data) => {
    const parsedData = JSON.parse(data);
    console.log(parsedData, parsedData.length);
    
    callback(setGeneExpression(parsedData));
    callback(setInProgress({
      type: "get_rgg_dotplot",
      value: false,
    }));
  })
  .catch((error) => {
    console.error("something fucky", error);
    callback(setInProgress({
      type: "get_rgg_dotplot",
      value: false,
    }));
  })
}