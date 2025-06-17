import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useAppSelector } from "../redux/hooks/hooks";
import { geneExpressionData } from "../types";
import { Box } from "@mui/material";

export function GeneGroupTable() {
  
  const data = useAppSelector((state) => state.plotReducer.geneExpression);
  
  let cols: GridColDef[] = [
    { field: "gene", headerName: "Gene", width: 180 },
    { field: "cluster", headerName: "Cluster", width: 180 },
    { field: "mean_expr", headerName: "Mean Expression", width: 180 },
    { field: "frac_expr", headerName: "Fraction Expression", width: 180 },
    { field: "pvals_adj", headerName: "Adjusted P-value", width: 180 },
    { field: "logfoldchange", headerName: "Log Fold change", width: 180 },
  ];
  
  return (
    <Box
      width="100%"
      sx={{
        overflow: "hidden"
      }}
    >
      
      <DataGrid
        columns={cols}
        rows={data}
        
        checkboxSelection
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 100 },
          },
        }}
        pageSizeOptions={[20, 50, 100]}
        onRowSelectionModelChange={(rsm, details) => {
          console.log(rsm, details)
        }}
        getRowId={(row: geneExpressionData) => `${row.cluster}_${row.gene}`}
      />
    </Box>
  )
  
}