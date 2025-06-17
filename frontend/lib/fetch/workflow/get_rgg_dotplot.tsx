
import { setGeneDendrogram, setGeneExpression, setInProgress, setNClusters, setNGenes, setProgressMessage } from "../../redux/reducers/plotReducer";
import { geneDendrogramData, geneExpressionData } from "../../types";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_rgg_dotplot(
  fileID: string,
  unsKey: string,
  nGenes: number,
  callback: Function
) {
  
  const request = `${BACKEND_ENDPOINT}/start_task_compute_rgg_dotplot/`;

  const formData = new FormData();
  formData.append("file_id", fileID);
  formData.append("uns_key", unsKey);
  formData.append("n_genes", nGenes.toString());
  
  callback(setInProgress({
    type: "get_rgg_dotplot",
    value: true,
  }));
  
  callback(setProgressMessage({
    type: "get_rgg_dotplot",
    value: "",
  }));
  
  fetch(request, {
    method: "POST",
    mode: "cors",
    body: formData
  })
  .then((response) => {
    if (!response.ok) {
      console.error("Something went wrong with get_rgg_dotplot()");
      callback(setInProgress({
        type: "get_rgg_dotplot",
        value: false,
      }));
    }
    return response.json();
  })
  .then((data: { task_id: string }) => {
    poll_rgg_dotplot_status(data.task_id, callback)
  })
  .catch((error) => {
    console.error("Something went wrong with get_rgg_dotplot()", error);
    callback(setInProgress({
      type: "get_rgg_dotplot",
      value: false,
    }));
  });
}

function poll_rgg_dotplot_status(taskID: string, callback: Function) {
  
  const request = `${BACKEND_ENDPOINT}/get_status_task?task_id=${taskID}`;
  
  const interval = setInterval(async () => {
    
    fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with poll_rgg_dotplot_status()");
        callback(setInProgress({
          type: "get_rgg_dotplot",
          value: false,
        }));
        callback(setProgressMessage({
          type: "get_rgg_dotplot",
          value: ""
        }));
        clearInterval(interval);
      }
      return response.json();
    })
    .then((data) => {
      if (data.status === "SUCCESS" || data.status === "FAILURE") {
        get_rgg_dotplot_result(taskID, callback);
        clearInterval(interval);
        callback(setProgressMessage({
          type: "get_rgg_dotplot",
          value: ""
        }));
      }
      else if (data.status === "PROGRESS") {
        callback(setProgressMessage({
          type: "get_rgg_dotplot",
          value: data.progress.status
        }));
      }
      
    })
    .catch((error) => {
      console.error("Something went wrong with poll_rgg_dotplot_status()", error);
      callback(setInProgress({
        type: "get_rgg_dotplot",
        value: false,
      }));
      callback(setProgressMessage({
        type: "get_rgg_dotplot",
        value: ""
      }));
      clearInterval(interval);
    });
    
  }, 2000); 
}

function get_rgg_dotplot_result(taskID: string, callback: Function) {
  
  const request = `${BACKEND_ENDPOINT}/get_finished_task?task_id=${taskID}`;
  
  type parsedDataType = {
    data: geneExpressionData[],
    dendro: geneDendrogramData,
    n_genes: number,
    n_clusters: number,
  }
  
  fetch(request)
  .then((response) => {
    if (!response.ok) {
      console.error("Something went wrong with get_rgg_dotplot_result()");
    }
    return response.json();
  })
  .then((data: parsedDataType) => {
    
    console.log(data);
    
    callback(setGeneExpression(data.data));
    callback(setGeneDendrogram(data.dendro));
    callback(setNGenes(data.n_genes));
    callback(setNClusters(data.n_clusters));
    
    callback(setInProgress({
      type: "get_rgg_dotplot",
      value: false,
    }));
  })
  .catch((error) => {
    console.error("Something went wrong with get_rgg_dotplot_result()", error);
    callback(setInProgress({
      type: "get_rgg_dotplot",
      value: false,
    }));
  })
  
}