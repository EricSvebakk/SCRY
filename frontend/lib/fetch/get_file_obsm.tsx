import { setObsm } from "../redux/reducers/plotReducer";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_file_obsm(
  fileID: string,
  obsm: string | null,
  callback: Function,
) {
  const request = `${BACKEND_ENDPOINT}/get_file_obsm?file_id=${fileID}&obsm=${obsm}`;

  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("something fucky happened");
      }
      return response.json();
    })
    .then((data) => {
      callback(setObsm(JSON.parse(data)));
    })
    .catch((error) => {
      console.error("something fucky", error);
    });
}