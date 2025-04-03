
import { addFiles } from "../redux/reducers/fileReducer";
import { AppDispatch } from "../redux/stores/store";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_filenames(dispatch: AppDispatch) {
  
  const request = `${BACKEND_ENDPOINT}/get_filenames`;
  
  console.log("get_filenames() query:", request);

  fetch(`${BACKEND_ENDPOINT}/get_filenames`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok for get_filenames()");
    }
    return response.json();
  })
  .then((data) => {
    console.log("get_filenames() result:", data)
    
    const fileRows = data.h5ad.map((e: string) => ({
      id: e,
      name: e,
    }))
    
    dispatch(addFiles(fileRows))
  })
}