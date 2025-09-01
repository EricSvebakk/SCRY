import { setAnndataField, setStatus } from "../../redux/reducers/plotReducer";
import { get_file_hierarchy } from "../get_file_hierarchy";
import { get_file_obs } from "../get_file_obs";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_clustering(
  fileID: string,
  unsKey: string,
  resolution: number,
  dispatch: Function
) {
  const request = `${BACKEND_ENDPOINT}/start_task_compute_clustering/`;

  const formData = new FormData();
  formData.append("file_id", fileID);
  formData.append("uns_key", unsKey);
  formData.append("resolution", resolution.toString());

  dispatch(
    setStatus({
      type: "get_clustering",
      value: true,
      message: "Getting clustering?"
    })
  );

  fetch(request, {
    method: "POST",
    mode: "cors",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with get_clustering(): not ok");
        dispatch(
          setStatus({
            type: "get_clustering",
            value: false,
          })
        );
      }
      return response.json();
    })
    .then((data: { task_id: string }) => {
      poll_clustering_status(
        data.task_id,
        fileID,
        unsKey,
        resolution,
        dispatch
      );
    })
    .catch((error) => {
      console.error("Something went wrong with get_clustering()", error);
      dispatch(
        setStatus({
          type: "get_clustering",
          value: false,
        })
      );
    });
}

function poll_clustering_status(
  taskID: string,
  fileID: string,
  unsKey: string,
  resolution: number,
  dispatch: Function
) {
  const request = `${BACKEND_ENDPOINT}/get_status_task?task_id=${taskID}`;

  const interval = setInterval(async () => {
    fetch(request)
      .then((response) => {
        if (!response.ok) {
          console.error("Something went wrong with poll_clustering_status()");
          dispatch(
            setStatus({
              type: "get_clustering",
              value: false,
            })
          );
          clearInterval(interval);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status === "SUCCESS" || data.status === "FAILURE") {
          get_clustering_result(taskID, fileID, unsKey, resolution, dispatch);
          clearInterval(interval);
        } else if (data.status === "PROGRESS") {
          dispatch(
            setStatus({
              type: "get_clustering",
              value: true,
              message: data.progress.status,
            })
          );
        }
      })
      .catch((error) => {
        console.error(
          "Something went wrong with poll_clustering_status()",
          error
        );
        dispatch(
          setStatus({
            type: "get_clustering",
            value: false,
          })
        );
        clearInterval(interval);
      });
  }, 2000);
}

function get_clustering_result(
  taskID: string,
  fileID: string,
  unsKey: string,
  resolution: number,
  dispatch: Function
) {
  const request = `${BACKEND_ENDPOINT}/get_finished_task?task_id=${taskID}`;

  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with get_clustering_result()");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);

      const resToString = `${resolution}`.replace(".", "_");
      const resKey = `leiden_${resToString}_${unsKey}`;

      dispatch(
        setAnndataField({
          attribute: "obs",
          field: "selectedKey",
          value: resKey,
        })
      );

      get_file_obs(fileID, resKey, dispatch);
      get_file_hierarchy(fileID, dispatch);

      dispatch(
        setStatus({
          type: "get_clustering",
          value: false,
        })
      );
    })
    .catch((error) => {
      console.error("Something went wrong with get_clustering_result()", error);
      dispatch(
        setStatus({
          type: "get_clustering",
          value: false,
        })
      );
    });
}
