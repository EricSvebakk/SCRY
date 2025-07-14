import { setAnndataField, setStatus } from "../redux/reducers/plotReducer";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_file_obs(
  fileID: string,
  obs: string | null,
  dispatch: Function
) {
  const request = `${BACKEND_ENDPOINT}/get_file_obs?file_id=${fileID}&obs=${obs}`;

  dispatch(
    setStatus({
      type: "get_file_obs",
      value: true,
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
          type: "get_file_obs",
          value: false,
        })
      );
      
      const parsedData: {
        categories: string[],
        codes: number[]
      } = JSON.parse(data);
      
      dispatch(
        setAnndataField({
          attribute: "obs",
          field: "indices",
          value: parsedData,
        })
      );
      
    })
    .catch((error) => {
      console.error("Something went wrong with get_file_obs()", error);
      dispatch(
        setStatus({
          type: "get_file_obs",
          value: false,
        })
      );
    });
}
