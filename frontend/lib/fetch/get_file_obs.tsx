
import { setObs } from "../redux/reducers/plotReducer";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_file_obs(
  fileID: string,
  obs: string | null,
  callback: Function
) {
  const request = `${BACKEND_ENDPOINT}/get_file_obs?file_id=${fileID}&obs=${obs}`;

  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("something fucky happened");
      }
      return response.json();
    })
    .then((data) => {
      // console.log("get_file_obs() data", data)
      callback(setObs(JSON.parse(data)));
    })
    .catch((error) => {
      console.error("something fucky", error);
    });
}