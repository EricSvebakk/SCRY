import { setStatus, setStatusBackend } from "../redux/reducers/plotReducer";
import { fetchOptions, tagsBackendAPI } from "../types";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function pollTaskStatus(
  taskID: string,
  statusID: typeof tagsBackendAPI[number],
  dispatch: Function,
  onSuccess: Function = () => {},
) {
  
  const request = `${BACKEND_ENDPOINT}/celery/status?task_id=${taskID}`;

  const interval = setInterval(async () => {
    fetch(request)
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
          onSuccess();
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