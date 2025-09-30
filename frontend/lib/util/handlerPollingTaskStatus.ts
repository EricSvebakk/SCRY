import { setStatusBackend } from "../redux/reducers/plotReducer";
import { RootState, store } from "../redux/stores/store";
import { backendEndpoints } from "../types";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function pollTaskStatus(
  taskID: string,
  statusID: typeof backendEndpoints[number],
  dispatch: Function,
  onSuccess: Function = () => {},
) {
  
  const state = store.getState() as RootState;
  
  const request = `${BACKEND_ENDPOINT}/celery/status?task_id=${taskID}`;

  const interval = setInterval(async () => {
    fetch(request, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "file_id": state.fileReducer.activeFile,
        "pass_key": state.fileReducer.passKey,
        "user_id": state.fileReducer.userID,
      }
    })
      .then((response) => {
        if (!response.ok) {
          console.error(`Something went wrong with ${pollTaskStatus.name}()`);
          dispatch(
            setStatusBackend({
              type: statusID,
              value: false,
            })
          );
          clearInterval(interval);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status === "SUCCESS" || data.status === "FAILURE") {
          clearInterval(interval);
          dispatch(
            setStatusBackend({
              type: statusID,
              value: false,
              message: "",
            })
          );
          
          if (data.status === "SUCCESS") {
            fetch(`${BACKEND_ENDPOINT}/celery/result?task_id=${taskID}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "file_id": state.fileReducer.activeFile,
                "pass_key": state.fileReducer.passKey,
                "user_id": state.fileReducer.userID,
              }
            })
            .then((data) => {
              if (!data.ok) {
                console.error("Something went wrong while fetching polling results")
                return;
              }
              return data.json();
            })
            .then((data: any) => {
              onSuccess(data.response);
            })
            .catch((error) => {
              console.error(error);
            });
          }
          
        } else if (data.status === "PROGRESS") {
          dispatch(
            setStatusBackend({
              type: statusID,
              value: true,
              message: data.progress.status,
            })
          );
        }
      })
      .catch((error) => {
        console.error(`Something went wrong with ${pollTaskStatus.name}()`, error);
        dispatch(
          setStatusBackend({
            type: statusID,
            value: false,
          })
        );
        clearInterval(interval);
      });
  }, 2000);
  
}