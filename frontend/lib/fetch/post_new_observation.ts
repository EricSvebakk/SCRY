
import { setStatus } from "../redux/reducers/plotReducer";
import { Reclustering } from "../types";
import { pollTaskStatus } from "../util/handlerPollingTaskStatus";
import { get_file_hierarchy } from "./get_file_hierarchy";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function post_new_observation(
  fileID: string,
  reclustering: Reclustering,
  dispatch: Function
) {
  const request = `${BACKEND_ENDPOINT}/start_task_create_observation/`;
  
  dispatch(
    setStatus({
      type: "post_new_observation",
      value: true,
    })
  );

  fetch(request, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(reclustering),
  })
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with post_new_observation()");
        dispatch(
          setStatus({
            type: "post_new_observation",
            value: false,
          })
        );
      }
      return response.json();
    })
    .then((data: { task_id: string }) => {
      
      pollTaskStatus(
        data.task_id,
        "post_new_observation",
        dispatch,
        () => {
          get_file_hierarchy(fileID, dispatch);
        }
      )
    })
    .catch((error) => {
      console.error("Something went wrong with post_new_observation()", error);
      dispatch(
        setStatus({
          type: "post_new_observation",
          value: false,
        })
      );
    });
}