
import { setInProgress, setObs } from "../redux/reducers/plotReducer";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_file_obs(
  fileID: string,
  obs: string | null,
  callback: Function
) {
  const request = `${BACKEND_ENDPOINT}/get_file_obs?file_id=${fileID}&obs=${obs}`;

  callback(setInProgress({
    type: "get_file_obs",
    value: true,
  }));
  
  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("something fucky happened");
      }
      return response.json();
    })
    .then((data) => {
      callback(setInProgress({
        type: "get_file_obs",
        value: false,
      }));
      
      callback(setObs(JSON.parse(data)));
    })
    .catch((error) => {
      console.error("Something went wrong with get_file_obs()", error);
      callback(setInProgress({
        type: "get_file_obs",
        value: false,
      }));
    });
}