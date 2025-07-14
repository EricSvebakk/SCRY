import { setAnndataField, setStatus } from "../redux/reducers/plotReducer";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_file_obsm(
  fileID: string,
  obsm: string | null,
  dispatch: Function,
) {
  const request = `${BACKEND_ENDPOINT}/get_file_obsm?file_id=${fileID}&obsm=${obsm}`;

  dispatch(
    setStatus({
      type: "get_embedding",
      value: true,
      message: "Loading in obsm data",
    })
  );
  
  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("something fucky happened");
      }
      return response.json();
    })
    .then((data) => {
      dispatch(
        setStatus({
          type: "get_embedding",
          value: false,
        })
      );
      
      const parsedData: {
        coordinates: number[][];
      } = JSON.parse(data);
      
      dispatch(
        setAnndataField({
          attribute: "obsm",
          field: "data",
          value: parsedData.coordinates,
        })
      );
    })
    .catch((error) => {
      console.error("Something went wrong with get_embedding()", error);
      dispatch(
        setStatus({
          type: "get_embedding",
          value: false,
        })
      );
    });
}