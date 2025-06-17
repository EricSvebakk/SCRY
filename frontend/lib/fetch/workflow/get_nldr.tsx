
import { setInProgress, setProgressMessage, setSelectedEmbedding } from "../../redux/reducers/plotReducer";
import { get_file_hierarchy } from "../get_file_hierarchy";
import { get_file_obsm } from "../get_file_obsm";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_nldr(
  fileID: string,
  adataKey: string,
  numPCs: number,
  minDist: number,
  spread: number,
  nNeighbors: number,
  callback: Function
) {
  const request = `${BACKEND_ENDPOINT}/start_task_compute_nldr/`;

  const formData = new FormData();
  formData.append("file_id", fileID);
  formData.append("adata_key", adataKey);
  formData.append("n_pcs", numPCs.toString());
  formData.append("min_dist", minDist.toString());
  formData.append("spread", spread.toString());
  formData.append("n_neighbors", nNeighbors.toString());

  callback(
    setInProgress({
      type: "get_embedding",
      value: true,
    })
  );
  
  callback(setProgressMessage({
    type: "get_embedding",
    value: "",
  }));

  fetch(request, {
    method: "POST",
    mode: "cors",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with get_nldr(): not ok");
        callback(setInProgress({
          type: "get_embedding",
          value: false,
        }));
      }
      return response.json();
    })
    .then((data: { task_id: string }) => {
      poll_nldr_status(data.task_id, fileID, adataKey, callback)
    })
    .catch((error) => {
      console.error("Something went wrong with get_nldr()", error);
      callback(
        setInProgress({
          type: "get_embedding",
          value: false,
        })
      );
    });
}

function poll_nldr_status(taskID: string, fileID: string, key: string, callback: Function) {
  
  const request = `${BACKEND_ENDPOINT}/get_status_task?task_id=${taskID}`;
  
  const interval = setInterval(async () => {
    
    fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with poll_nldr_status()");
        callback(setInProgress({
          type: "get_embedding",
          value: false,
        }));
        callback(setProgressMessage({
          type: "get_embedding",
          value: ""
        }));
        clearInterval(interval);
      }
      return response.json();
    })
    .then((data) => {
      if (data.status === "SUCCESS" || data.status === "FAILURE") {
        get_nldr_result(taskID, fileID, key, callback);
        clearInterval(interval);
        callback(setProgressMessage({
          type: "get_embedding",
          value: ""
        }));
      }
      else if (data.status === "PROGRESS") {
        callback(setProgressMessage({
          type: "get_embedding",
          value: data.progress.status
        }));
      }
      
    })
    .catch((error) => {
      console.error("Something went wrong with poll_nldr_status()", error);
      callback(setInProgress({
        type: "get_embedding",
        value: false,
      }));
      callback(setProgressMessage({
        type: "get_embedding",
        value: ""
      }));
      clearInterval(interval);
    });
    
  }, 2000); 
  
}

function get_nldr_result(taskID: string, fileID: string, key: string, callback: Function) {
  
  const request = `${BACKEND_ENDPOINT}/get_finished_task?task_id=${taskID}`;
  
  fetch(request)
  .then((response) => {
    if (!response.ok) {
      console.error("Something went wrong with get_nldr_result()");
    }
    return response.json();
  })
  .then((data) => {
    
    console.log(data);
    
    const embeddingKey = `X_umap_${key}`
    
    callback(setSelectedEmbedding(embeddingKey));
    
    get_file_obsm(fileID, embeddingKey, callback);
    get_file_hierarchy(fileID, callback);
    
    callback(setInProgress({
      type: "get_embedding",
      value: false,
    }));
  })
  .catch((error) => {
    console.error("Something went wrong with get_nldr_result()", error);
    callback(setInProgress({
      type: "get_embedding",
      value: false,
    }));
  })
  
}