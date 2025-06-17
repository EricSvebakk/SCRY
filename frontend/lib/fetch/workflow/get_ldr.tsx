
import { setInProgress, setProgressMessage, setSelectedEmbedding } from "../../redux/reducers/plotReducer";
import { get_file_hierarchy } from "../get_file_hierarchy";
import { get_file_obsm } from "../get_file_obsm";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_ldr(
  fileID: string,
  numPCs: number,
  callback: Function
) {
  const request = `${BACKEND_ENDPOINT}/start_task_compute_ldr/`;

  const formData = new FormData();
  formData.append("file_id", fileID);
  formData.append("n_pcs", numPCs.toString());

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
        console.error("Something went wrong with get_ldr(): not ok");
        callback(setInProgress({
          type: "get_embedding",
          value: false,
        }));
      }
      return response.json();
    })
    .then((data: { task_id: string }) => {
      poll_ldr_status(data.task_id, fileID, numPCs, callback)
    })
    .catch((error) => {
      console.error("Something went wrong with get_ldr()", error);
      callback(
        setInProgress({
          type: "get_embedding",
          value: false,
        })
      );
    });
}

function poll_ldr_status(taskID: string, fileID: string, nPCs: number, callback: Function) {
  
  const request = `${BACKEND_ENDPOINT}/get_status_task?task_id=${taskID}`;
  
  const interval = setInterval(async () => {
    
    fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with poll_ldr_status()");
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
        get_ldr_result(taskID, fileID, nPCs, callback);
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
      console.error("Something went wrong with poll_ldr_status()", error);
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

function get_ldr_result(taskID: string, fileID: string, nPCs: number, callback: Function) {
  
  const request = `${BACKEND_ENDPOINT}/get_finished_task?task_id=${taskID}`;
  
  fetch(request)
  .then((response) => {
    if (!response.ok) {
      console.error("Something went wrong with get_ldr_result()");
    }
    return response.json();
  })
  .then((data) => {
    
    console.log(data);
    
    const embeddingKey = `X_pca_${nPCs}`
    
    callback(setSelectedEmbedding(embeddingKey));
    
    get_file_obsm(fileID, embeddingKey, callback);
    get_file_hierarchy(fileID, callback);
    
    callback(setInProgress({
      type: "get_embedding",
      value: false,
    }));
  })
  .catch((error) => {
    console.error("Something went wrong with get_ldr_result()", error);
    callback(setInProgress({
      type: "get_embedding",
      value: false,
    }));
  })
  
}