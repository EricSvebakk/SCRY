import { setGeneReport } from "../redux/reducers/plotReducer";
import { geneReport } from "../types";

export default function get_ncbi_gene_summary(gene: string, dispatch: Function) {
  
  const request =
    "https://api.ncbi.nlm.nih.gov/datasets/v2/gene/symbol/" + gene + "/taxon/9606";
    
  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("something fucky happened");
      }
      return response.json();
    })
    .then((data: any) => {

      // TODO: Determine if multiple reports should be displayed
      const report = data.reports[0].gene;
      
      const reportData: geneReport = {
        id: report.gene_id,
        symbol: gene,
        description: report.description,
        summary: report.summary.map((e: any) => e.description),
        synonyms: report.synonyms,
        source: `https://www.ncbi.nlm.nih.gov/gene/${report.gene_id}`,
        taxonmy: {
          id: report.tax_id,
          name: report.taxname,
        },
      };
      
      dispatch(setGeneReport(reportData));      
    })
    .catch((error) => {
      console.error("Something went wrong with get_ncbi_gene_summary()", error);
    });
  
}