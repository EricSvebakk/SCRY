
"use client"

import { get_filenames } from "@/lib/fetch/get_filenames";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { selectFile } from "@/lib/redux/reducers/fileReducer";
import { Button, Stack } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect } from "react";

export default function RootPage() {
  
  const dispatch = useAppDispatch();
  
  const filenames = useAppSelector((state) => state.fileReducer.files);
  
  
  let cols: GridColDef[] = [
    { field: "name", headerName: "Name", width: 500 },
    { field: "fileType", headerName: "File type" },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => {
        const fileName: string = params.row.id;
        const isH5AD = fileName.endsWith("h5ad");
        // const isZarr = true

        return (
          <Button
            variant="contained"
            // disabled={!isZarr}
            color={isH5AD ? "primary" : "secondary"}
            onClick={() => {
              dispatch(selectFile(params.row.id));
            }}
          >
            Open
          </Button>
        );
      },
    },
  ];
  
  useEffect(() => {
    get_filenames(dispatch);
  }, [])
  
  return (
    <Stack>
      <DataGrid columns={cols} rows={filenames} />
    </Stack>
  );
}