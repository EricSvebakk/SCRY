import { Dispatch, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { setStatus } from "../../redux/reducers/plotReducer";
import { get_filenames } from "../get_filenames";
import { FileState, InitialPlotStateProps } from "@/lib/types";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function save_file_as(
  fileID: string,
  newFileID: string,
  selectedObs: string,
  selectedObsClusters: string[],
  dispatch: ThunkDispatch<
    {
      fileReducer: FileState;
      plotReducer: InitialPlotStateProps;
    },
    undefined,
    UnknownAction
  > &
    Dispatch<UnknownAction>
) {
  const request = `${BACKEND_ENDPOINT}/start_task_compute_save_file_as/`;

  const formData = new FormData();
  formData.append("file_id", fileID);
  formData.append("new_file_id", newFileID);
  formData.append("selected_obs", selectedObs);
  formData.append("new_file_id", newFileID);

  selectedObsClusters.forEach((cluster) => {
    formData.append("selected_obs_clusters", cluster);
  });

  dispatch(
    setStatus({
      type: "save_file_as",
      value: true,
      message: `Saving clusters to new file "${newFileID}"`,
    })
  );

  fetch(request, {
    method: "POST",
    mode: "cors",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with save_file_as(): not ok");
        dispatch(
          setStatus({
            type: "save_file_as",
            value: false,
          })
        );
      }
      return response.json();
    })
    .then((data: { task_id: string }) => {
      poll_save_file_as_status(
        data.task_id,
        newFileID,
        dispatch
      );
    })
    .catch((error) => {
      console.error("Something went wrong with save_file_as()", error);
      dispatch(
        setStatus({
          type: "save_file_as",
          value: false,
        })
      );
    });
}

function poll_save_file_as_status(
  taskID: string,
  newFileID: string,
  dispatch: ThunkDispatch<
    {
      fileReducer: FileState;
      plotReducer: InitialPlotStateProps;
    },
    undefined,
    UnknownAction
  > &
    Dispatch<UnknownAction>
) {
  const request = `${BACKEND_ENDPOINT}/get_status_task?task_id=${taskID}`;

  const interval = setInterval(async () => {
    fetch(request)
      .then((response) => {
        if (!response.ok) {
          console.error("Something went wrong with poll_clustering_status()");
          dispatch(
            setStatus({
              type: "save_file_as",
              value: false,
            })
          );
          clearInterval(interval);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status === "SUCCESS" || data.status === "FAILURE") {
          save_file_as_result(
            taskID,
            newFileID,
            dispatch
          );
          clearInterval(interval);
        } else if (data.status === "PROGRESS") {
          dispatch(
            setStatus({
              type: "save_file_as",
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
            type: "save_file_as",
            value: false,
          })
        );
        clearInterval(interval);
      });
  }, 2000);
}

function save_file_as_result(
  taskID: string,
  newFileID: string,
  dispatch: ThunkDispatch<
    {
      fileReducer: FileState;
      plotReducer: InitialPlotStateProps;
    },
    undefined,
    UnknownAction
  > &
    Dispatch<UnknownAction>
) {
  const request = `${BACKEND_ENDPOINT}/get_finished_task?task_id=${taskID}`;

  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with save_file_as_result()");
      }
      return response.json();
    })
    .then((data) => {

      get_filenames(dispatch);

      dispatch(
        setStatus({
          type: "save_file_as",
          value: false,
        })
      );
    })
    .catch((error) => {
      console.error("Something went wrong with save_file_as_result()", error);
      dispatch(
        setStatus({
          type: "save_file_as",
          value: false,
        })
      );
    });
}
