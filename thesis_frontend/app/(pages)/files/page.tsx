
"use client"

import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, Stack, Tooltip, Typography } from "@mui/material"
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid"
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/stores/store";
import { addFile, addFiles, selectFile, selectFiles } from "@/lib/redux/reducers/reducer1";
import Link from "next/link";
import { CloudUpload } from "@mui/icons-material";
import styled from "@emotion/styled";


const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});


async function fetchFiles() {
  const res = await fetch("http://localhost:8020/get_filenames");
  const data = await res.json();
  return data;
}

async function uploadFile(
  file: File | null,
  setUploadProgress: Dispatch<SetStateAction<number>>,
  setUploadLimit: Dispatch<SetStateAction<number>>
) {
  if (!(file !== null && file?.name.toLocaleLowerCase().includes("h5ad")))
    return;

  const chunkSize = 1024 * 1024 * 10; // 1MB chunks
  const totalChunks = Math.ceil(file.size / chunkSize);
  const fileId = `${file.name}-${Date.now()}`; // Unique file identifier

  setUploadLimit(totalChunks);

  for (let i = 0; i < totalChunks; i++) {
    const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);

    const formData = new FormData();
    formData.append("chunk", chunk);
    formData.append("chunk_index", i.toString());
    formData.append("total_chunks", totalChunks.toString());
    formData.append("file_id", fileId);
    
    fetch(`http://localhost:8020/upload_chunk`, {
      method: "POST",
      mode: "cors",
      body: formData,
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok for chunk " + i);
      }
      return response.json()
    })
    .then((data) => {
      console.log(data)
      setUploadProgress((progress) => progress + 1);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    })
  }
}

async function finalizeFile(fileID: string) {
  
  
  
  // fetch(`http://localhost:8020/convert_file`, {
  //   method: "POST",
  //   mode: "cors",
  //   body: formData,
  // });
  
  return (
    true
  );
  
}


export default function FilesPage() {
  
  const [dynamicRows, setDynamicRows] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLimit, setUploadLimit] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  
  const dispatch = useDispatch();
  const files = useSelector((state: RootState) => state.fileReducer.files);

  // console.log(files);
  
  // console.log(uploadProgress, uploadLimit);
  
  let cols: GridColDef[] = [
    { field: "name", headerName: "Name", width: 500 },
    { field: "col2", headerName: "Column 2", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => {
        
        return (
          // <Link href={`/files/${params.row.id}`}>
            <Button
              variant="contained"
              onClick={() => dispatch(selectFile(params.row.id))}
            >
              Open
            </Button>
          // </Link>
        );
      },
      // hide: true,
    },
  ];
  
  useEffect(() => {
    
    fetchFiles()
    .then((data: any) => {
      const newRows = data.map((e: any, i: number) => ({
        id: e,
        name: e,
        col2: "test",
      }));
      dispatch(addFiles(newRows));
      
      setDynamicRows(newRows);
    });
    
  }, []);
  
  
  return (
    <Box>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Button variant="contained" onClick={() => setOpenDialog(true)}>
            Upload new file
          </Button>
        </Grid>
        <Grid item>
          <DataGrid
            columns={cols}
            rows={dynamicRows}
            // onRowSelectionModelChange={(e) => {
            //   dispatch(selectFiles(e as string[]));
            // }}
          />
        </Grid>
      </Grid>
      
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        sx={{
          "& .MuiDialog-paper": {
            width: "80%",
            maxWidth: "500px",
          },
        }}
        // open={files.length > 0}
      >
        <DialogTitle>Please provide an H5AD-file</DialogTitle>
        <DialogContent>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Typography variant="caption">
                The uploaded file will be converted to Zarr format
              </Typography>
            </Grid>
            <Grid item>
              <Stack direction="row" columnGap={2} alignItems="center">
                <label htmlFor="file-upload" key="selectFile_label">
                  <Button
                    component="span"
                    variant="contained"
                    size="small"
                    sx={{
                      width: 200,
                    }}
                    // fullWidth
                    startIcon={<CloudUpload />}
                    key="selectFile_button"
                  >
                    Select file
                  </Button>
                </label>
                <Typography key="selectFile_typography">
                  <VisuallyHiddenInput
                    id="file-upload"
                    type="file"
                    onChange={(e: any) => {
                      if (e.target.files) {
                        setFile(e.target.files[0]);
                      }
                    }}
                    key="selectFile_vhi"
                  />
                </Typography>
                <Tooltip
                  title={file ? file?.name : ""}
                  key="fileName_tooltip"
                  placement="right-end"
                >
                  <Typography
                    variant="caption"
                    key="fileName_typography"
                    width={200}
                    noWrap={true}
                    // ellipsis
                    // overflow="clip"
                    // textOverflow="ellipsis"
                  >
                    {file ? file?.name : ""}&nbsp;
                  </Typography>
                </Tooltip>
              </Stack>
            </Grid>

            {/* <Grid item>
            </Grid> */}

            <Grid item xs key="uploadFileButton_grid">
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                key="progressElement_stack"
              >
                <Button
                  variant="contained"
                  // fullWidth
                  sx={{
                    width: 200,
                  }}
                  size="small"
                  onClick={() =>
                    uploadFile(
                      file,
                      setUploadProgress,
                      setUploadLimit
                    )
                  }
                  key="uploadFileButton_button"
                >
                  Upload file
                </Button>

                <progress
                  value={uploadProgress}
                  max={uploadLimit}
                  // style={{ width: "100%" }}
                  key="progressElement_progress"
                />
                <Typography key="progressElement_p">
                  {uploadLimit === 0 ? 0 : ((uploadProgress / uploadLimit) * 100).toFixed(1)} %
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      
    </Box>
  );
  
}