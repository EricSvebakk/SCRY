import { setHierarchy, setInProgress } from "../redux/reducers/plotReducer";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_file_hierarchy(
  fileID: string,
  callback: Function
) {
  
  const request = `${BACKEND_ENDPOINT}/get_file_hierarchy?file_id=${fileID}`;
  
  callback(setInProgress({
    type: "get_file_hierarchy",
    value: true,
  }));
  
  fetch(request)
  .then((response) => {
    if (!response.ok) {
      console.error("Something went wrong with get_file_hierarchy()");
    }
    return response.json();
  })
  .then((data) => {
    callback(setInProgress({
      type: "get_file_hierarchy",
      value: false,
    }));
    
    console.log(data);
    callback(setHierarchy(data));
  })
  .catch((error) => {
    console.error("Something went wrong with get_file_hierarchy()", error);
    callback(setInProgress({
      type: "get_file_hierarchy",
      value: false,
    }));
  })
}