import { setFieldAcrossAnndata, setStatus } from "../redux/reducers/plotReducer";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_file_hierarchy(fileID: string, dispatch: Function) {
  const request = `${BACKEND_ENDPOINT}/get_file_hierarchy?file_id=${fileID}`;

  dispatch(
    setStatus({
      type: "get_file_hierarchy",
      value: true,
      message: "Loading in AnnData metadata",
    })
  );

  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with get_file_hierarchy()");
      }
      return response.json();
    })
    .then((data) => {
      dispatch(
        setStatus({
          type: "get_file_hierarchy",
          value: false,
        })
      );

      console.log(data);

      dispatch(
        setFieldAcrossAnndata({
          field: "keys",
          values: data,
        })
      );
    })
    .catch((error) => {
      console.error("Something went wrong with get_file_hierarchy()", error);
      dispatch(
        setStatus({
          type: "get_file_hierarchy",
          value: false,
        })
      );
    });
}
