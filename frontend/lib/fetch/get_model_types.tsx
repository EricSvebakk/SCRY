
import { setModelTypes, setStatus } from "../redux/reducers/plotReducer";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_model_types(fileID: string, dispatch: Function) {
  const request = `${BACKEND_ENDPOINT}/get_model_types?file_id=${fileID}`;

  dispatch(
    setStatus({
      type: "get_model_types",
      value: true,
      message: "Fetching model types",
    })
  );
  
  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with get_model_types()");
      }
      return response.json();
    })
    .then((data) => {
      dispatch(setModelTypes(data.models));
      dispatch(
        setStatus({
          type: "get_model_types",
          value: false,
        })
      );
    })
    .catch((error) => {
      console.error("Something went wrong with get_model_types()", error);
      dispatch(
        setStatus({
          type: "get_model_types",
          value: false,
        })
      );
    });
}