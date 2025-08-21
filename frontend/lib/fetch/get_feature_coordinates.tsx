
import { setAnndataField, setStatus } from "../redux/reducers/plotReducer";
import { AnndataIndices } from "../types";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_feature_coordinates(
  fileID: string,
  featureKey: string | null,
  dispatch: Function
) {
  const request = `${BACKEND_ENDPOINT}/get_feature_coordinates?file_id=${fileID}&feature_key=${featureKey}`;

  dispatch(
    setStatus({
      type: "get_feature_coordinates",
      value: true,
      message: "Loading in feature data",
    })
  );

  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("something fucky happened");
      }
      return response.json();
    })
    .then((data: AnndataIndices) => {
      console.log(data);

      dispatch(
        setStatus({
          type: "get_feature_coordinates",
          value: false,
        })
      );

      dispatch(
        setAnndataField({
          attribute: "var",
          field: "indices",
          value: data,
        })
      );
    })
    .catch((error) => {
      console.error("Something went wrong with get_feature_coordinates()", error);
      dispatch(
        setStatus({
          type: "get_feature_coordinates",
          value: false,
        })
      );
    });
}
