

import { setGeneDendrogram, setGeneExpression, setInProgress, setNClusters, setNGenes } from "../redux/reducers/plotReducer";
import { geneDendrogramData, geneExpressionData } from "../types";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_rgg_dotplot(
  fileID: string,
  unsKey: string,
  nGenes: number,
  // nGroups: number,
  callback: Function
) {
  
  const request = `${BACKEND_ENDPOINT}/get_rgg_dotplot?file_id=${fileID}&uns_key=${unsKey}&n_genes=${nGenes}`;
  
  callback(setInProgress({
    type: "get_rgg_dotplot",
    value: true,
  }));
  
  fetch(request)
  .then((response) => {
    if (!response.ok) {
      console.error("Something went wrong with get_rgg_dotplot()");
    }
    return response.json();
  })
  .then((data) => {
    
    type parsedDataType = {
      data: geneExpressionData[],
      dendro: geneDendrogramData,
      n_genes: number,
      n_clusters: number,
    }
    
    const parsedData: parsedDataType = JSON.parse(data);
    console.log(parsedData);
    
    callback(setGeneExpression(parsedData.data));
    callback(setGeneDendrogram(parsedData.dendro));
    callback(setNGenes(parsedData.n_genes));
    callback(setNClusters(parsedData.n_clusters));
    
    callback(setInProgress({
      type: "get_rgg_dotplot",
      value: false,
    }));
  })
  .catch((error) => {
    console.error("Something went wrong with get_rgg_dotplot()", error);
    callback(setInProgress({
      type: "get_rgg_dotplot",
      value: false,
    }));
  })
}