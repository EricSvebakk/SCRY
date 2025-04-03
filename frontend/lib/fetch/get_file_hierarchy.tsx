import { setHierarchy } from "../redux/reducers/plotReducer";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_file_hierarchy(
  fileID: string,
  callback: Function
) {
  
  const request = `${BACKEND_ENDPOINT}/get_file_hierarchy?file_id=${fileID}`;
  
  fetch(request)
  .then((response) => {
    if (!response.ok) {
      console.error("something fucky happened")
    }
    return response.json();
  })
  .then((data) => {
    console.log(data);
    callback(setHierarchy(data));
  })
  .catch((error) => {
    console.error("something fucky", error);
  })
}