
import { setAnndataField, setStatus } from "../../redux/reducers/plotReducer";
import { get_file_hierarchy } from "../get_file_hierarchy";
import { get_file_obs } from "../get_file_obs";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_celltypist_annotations(
  fileID: string,
  annotationKey: string,
  connectivitiesKey: string,
  annotationModel: string,
  dispatch: Function
) {
  const request = `${BACKEND_ENDPOINT}/start_task_compute_celltypist_annotations/`;

  const formData = new FormData();
  formData.append("file_id", fileID);
  formData.append("annotation_key", annotationKey);
  formData.append("connectivities_key", connectivitiesKey);
  formData.append("annotation_model", annotationModel);

  dispatch(
    setStatus({
      type: "get_celltypist_annotations",
      value: true,
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
            type: "get_celltypist_annotations",
            value: false,
          })
        );
      }
      return response.json();
    })
    .then((data: { task_id: string }) => {
      poll_annotation_status(
        data.task_id,
        fileID,
        connectivitiesKey,
        dispatch
      );
    })
    .catch((error) => {
      console.error("Something went wrong with get_clustering()", error);
      dispatch(
        setStatus({
          type: "get_celltypist_annotations",
          value: false,
        })
      );
    });
}

function poll_annotation_status(
  taskID: string,
  fileID: string,
  connectivitiesKey: string,
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
              type: "get_celltypist_annotations",
              value: false,
            })
          );
          clearInterval(interval);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status === "SUCCESS" || data.status === "FAILURE") {
          get_annotation_result(
            taskID,
            fileID,
            connectivitiesKey,
            dispatch
          );
          clearInterval(interval);
        } else if (data.status === "PROGRESS") {
          dispatch(
            setStatus({
              type: "get_celltypist_annotations",
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
            type: "get_celltypist_annotations",
            value: false,
          })
        );
        clearInterval(interval);
      });
  }, 2000);
}

function get_annotation_result(
  taskID: string,
  fileID: string,
  connectivitiesKey: string,
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

      const conKey = `${connectivitiesKey}_MAJORITY_VOTING`

      dispatch(
        setAnndataField({
          attribute: "obs",
          field: "selectedKey",
          value: conKey,
        })
      );

      get_file_obs(fileID, conKey, dispatch);
      get_file_hierarchy(fileID, dispatch);

      dispatch(
        setStatus({
          type: "get_celltypist_annotations",
          value: false,
        })
      );
    })
    .catch((error) => {
      console.error("Something went wrong with get_clustering_result()", error);
      dispatch(
        setStatus({
          type: "get_celltypist_annotations",
          value: false,
        })
      );
    });
}
