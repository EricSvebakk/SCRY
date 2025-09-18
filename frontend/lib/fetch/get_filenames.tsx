
import { addFiles } from "../redux/reducers/fileReducer";
import { setStatus } from "../redux/reducers/plotReducer";
import { AppDispatch } from "../redux/stores/store";
import { fileType } from "../types";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_filenames(dispatch: AppDispatch) {
  
  const request = `${BACKEND_ENDPOINT}/system/files`;
  
  console.log("get_filenames() query:", request);

  dispatch(setStatus({
    type: "get_filenames",
    value: true,
    message: "Fetching filenames"
  }));
  
  fetch(request, {
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
    
    if (data.ok) {
      const fileRows = data.response.files
        .map((e: string, i: number) => ({
          id: e,
          name: e,
          fileSize: data.response.h5ad_sizes[i],
          fileType: e.split(".")[1],
        }))
        .sort((a: fileType, b: fileType) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      
      dispatch(addFiles(fileRows))
    }
    
    
    dispatch(setStatus({
      type: "get_filenames",
      value: false,
    }));
  })
  .catch((error) => {
    console.error("Something went wrong with get_filenames()", error);
    
    dispatch(setStatus({
      type: "get_filenames",
      value: false,
    }));
  });
}