import { setGDEField, setStatus } from "../../redux/reducers/plotReducer";
import { geneDendrogramData, geneExpressionData } from "../../types";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export function get_rgg_dotplot(
  fileID: string,
  unsKey: string,
  nGenes: number,
  selectedGenes: string[],
  dispatch: Function
) {
  const request = `${BACKEND_ENDPOINT}/start_task_compute_rgg_dotplot/`;

  const formData = new FormData();
  formData.append("file_id", fileID);
  formData.append("uns_key", unsKey);
  formData.append("n_genes", nGenes.toString());
  
  selectedGenes.forEach((gene) => {
    formData.append("selected_genes", gene)
  });
  
  dispatch(
    setStatus({
      type: "get_rgg_dotplot",
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
        console.error("Something went wrong with get_rgg_dotplot()");
        dispatch(
          setStatus({
            type: "get_rgg_dotplot",
            value: false,
          })
        );
      }
      return response.json();
    })
    .then((data: { task_id: string }) => {
      poll_rgg_dotplot_status(data.task_id, dispatch);
    })
    .catch((error) => {
      console.error("Something went wrong with get_rgg_dotplot()", error);
      dispatch(
        setStatus({
          type: "get_rgg_dotplot",
          value: false,
        })
      );
    });
}

function poll_rgg_dotplot_status(taskID: string, dispatch: Function) {
  const request = `${BACKEND_ENDPOINT}/get_status_task?task_id=${taskID}`;

  const interval = setInterval(async () => {
    fetch(request)
      .then((response) => {
        if (!response.ok) {
          console.error("Something went wrong with poll_rgg_dotplot_status()");
          dispatch(
            setStatus({
              type: "get_rgg_dotplot",
              value: false,
            })
          );
          clearInterval(interval);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status === "SUCCESS" || data.status === "FAILURE") {
          get_rgg_dotplot_result(taskID, dispatch);
          clearInterval(interval);
        } else if (data.status === "PROGRESS") {
          dispatch(
            setStatus({
              type: "get_rgg_dotplot",
              value: true,
              message: data.progress.status,
            })
          );
        }
      })
      .catch((error) => {
        console.error(
          "Something went wrong with poll_rgg_dotplot_status()",
          error
        );
        dispatch(
          setStatus({
            type: "get_rgg_dotplot",
            value: false,
          })
        );
        clearInterval(interval);
      });
  }, 2000);
}

function get_rgg_dotplot_result(taskID: string, dispatch: Function) {
  const request = `${BACKEND_ENDPOINT}/get_finished_task?task_id=${taskID}`;

  type parsedDataType = {
    table: geneExpressionData[];
    dendro: string;
    n_genes: number;
    n_clusters: number;
  };

  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("Something went wrong with get_rgg_dotplot_result()");
      }
      return response.json();
    })
    .then((data: parsedDataType) => {
      console.log(data);

      const dendro: geneDendrogramData = JSON.parse(data.dendro)

      dispatch(
        setGDEField({
          field: "expression",
          value: data.table
        })
      );
      dispatch(
        setGDEField({
          field: "dendrogram",
          value: dendro,
        })
      );
      dispatch(
        setGDEField({
          field: "nGenes",
          value: data.n_genes,
        })
      );
      dispatch(
        setGDEField({
          field: "nClusters",
          value: data.n_clusters,
        })
      );
      
      dispatch(
        setStatus({
          type: "get_rgg_dotplot",
          value: false,
        })
      );
    })
    .catch((error) => {
      console.error(
        "Something went wrong with get_rgg_dotplot_result()",
        error
      );
      dispatch(
        setStatus({
          type: "get_rgg_dotplot",
          value: false,
        })
      );
    });
}
