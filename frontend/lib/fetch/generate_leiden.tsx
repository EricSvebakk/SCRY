import { setInProgress } from "../redux/reducers/plotReducer";
import { get_file_hierarchy } from "./get_file_hierarchy";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function generate_leiden(
  fileID: string,
  adataKey: string,
  resolution: number,
  callback: Function,
) {
  
  const request = `${BACKEND_ENDPOINT}/generate_leiden/`;
  
  const formData = new FormData();
  formData.append("file_id", fileID);
  formData.append("adata_key", adataKey);
  formData.append("resolution", resolution.toString());
  
  callback(setInProgress({
    type: "generate_leiden",
    value: true,
  }));
  
  fetch(request, {
    method: "POST",
    mode: "cors",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with generate_leiden(): not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("generate_leiden() result", data);
      callback(setInProgress({
        type: "generate_leiden",
        value: false,
      }));
      
      get_file_hierarchy(fileID, callback);
    })
    .catch((error) => {
      console.error("Something went wrong with generate_leiden()", error);
      callback(
        setInProgress({
          type: "generate_leiden",
          value: false,
        })
      );
    });
}