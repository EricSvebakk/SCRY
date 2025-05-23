import { setGeneExpression } from "../redux/reducers/plotReducer";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

function get_top_gene_expression(
  fileID: string,
  selectedCategory: string,
  selectedLabels: string[],
  selectedGenes: string[],
  callback: Function
) {
  const request = `${BACKEND_ENDPOINT}/get_top_gene_expression/`;

  const formData = new FormData();
  formData.append("file_id", fileID);
  formData.append("obs", selectedCategory);

  selectedLabels.forEach((label: string) => {
    formData.append("labels", label);
  });

  selectedGenes.forEach((gene: string) => {
    formData.append("genes", gene);
  });

  fetch(request, {
    method: "POST",
    mode: "cors",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        console.error("something expression fucky happened");
      }
      return response.json();
    })
    .then((data) => {
      callback(setGeneExpression(JSON.parse(data)));
    })
    .catch((error) => {
      console.error("something fucky", error);
    });
}