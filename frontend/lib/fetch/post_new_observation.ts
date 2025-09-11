
import { setStatus } from "../redux/reducers/plotReducer";
import { Reclustering } from "../types";
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
      poll_new_observation_status(data.task_id, fileID, dispatch);
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

function poll_new_observation_status(taskID: string, fileID: string, dispatch: Function) {
  const request = `${BACKEND_ENDPOINT}/get_status_task?task_id=${taskID}`;

  const interval = setInterval(async () => {
    fetch(request)
      .then((response) => {
        if (!response.ok) {
          console.error("Something went wrong with poll_new_observation_status()");
          dispatch(
            setStatus({
              type: "post_new_observation",
              value: false,
            })
          );
          clearInterval(interval);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status === "SUCCESS" || data.status === "FAILURE") {
          post_new_observation_result(taskID, fileID, dispatch);
          clearInterval(interval);
        } else if (data.status === "PROGRESS") {
          dispatch(
            setStatus({
              type: "post_new_observation",
              value: true,
              message: data.progress.status,
            })
          );
        }
      })
      .catch((error) => {
        console.error(
          "Something went wrong with poll_new_observation_status()",
          error
        );
        dispatch(
          setStatus({
            type: "post_new_observation",
            value: false,
          })
        );
        clearInterval(interval);
      });
  }, 2000);
}

function post_new_observation_result(taskID: string, fileID: string, dispatch: Function) {
  const request = `${BACKEND_ENDPOINT}/get_finished_task?task_id=${taskID}`;

  type parsedDataType = {
    key: string;
  };

  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with post_new_observation_result()");
      }
      return response.json();
    })
    .then((data: parsedDataType) => {
      console.log(data);

      const key: string = data.key

      get_file_hierarchy(fileID, dispatch);
    })
    .catch((error) => {
      console.error(
        "Something went wrong with post_new_observation_result()",
        error
      );
      dispatch(
        setStatus({
          type: "post_new_observation",
          value: false,
        })
      );
    });
}
