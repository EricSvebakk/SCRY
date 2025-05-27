import { DataGrid, GridColDef } from "@mui/x-data-grid";

export function GeneGroupTable(props: {
  // rows: [];
}) {
  
    let cols: GridColDef[] = [
      { field: "name", headerName: "Name", width: 500 },
      { field: "fileType", headerName: "File type" },
      // { field: "fileSize",
      //   headerName: "File size",
      //   // sortComparator: (v1, v2)
      //   valueFormatter: (value) => {
          
      //     const suffixes = ["KB", "MB", "GB"]
          
      //     const ceilLogSize = Math.ceil(Math.log10(value) / 4)
      //     const fileSize = value * ((1/1024)**ceilLogSize)
      //     const fileSizeResult = fileSize.toLocaleString(
      //       undefined,
      //       { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      //     )
          
      //     return fileSizeResult + " " + suffixes[ceilLogSize - 1]
      //   }
      // },
      // {
      //   field: "actions",
      //   headerName: "Actions",
      //   width: 150,
      //   renderCell: (params) => {
      //     const fileName: string = params.row.id;
      //     const isH5AD = fileName.endsWith("h5ad");
      //     // const isZarr = true
  
      //     return (
      //       <Button
      //         variant="contained"
      //         // disabled={!isZarr}
      //         color={isH5AD ? "primary" : "secondary"}
      //         onClick={() => {
      //           dispatch(selectFile(params.row.id));
      //         }}
      //       >
      //         Open
      //       </Button>
      //     );
      //   },
      // },
    ];
  
  return (
    <DataGrid columns={cols} rows={props.rows} />
  )
  
}