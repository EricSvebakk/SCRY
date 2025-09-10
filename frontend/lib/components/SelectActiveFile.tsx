
import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import React, { useEffect, useState } from "react";
import { theme } from "@/app/layout";
import formatFileSize from "@/lib/util/formatFileSize";
import { useRouter } from "next/navigation";
import CurrentProgress from "./OverlayCurrentProgress";
import { get_filenames } from "../fetch/get_filenames";

export default function SelectActiveFile() {
  
  const filenames = useAppSelector((state) => state.fileReducer.files);
  const activeFile = useAppSelector((state) => state.fileReducer.activeFile);
  const status = useAppSelector((state) => state.plotReducer.status.save_file_as);
  
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    get_filenames(dispatch);
  }, [filenames.length])
  
  return (
    <Stack
      direction="column"
      rowGap={1}
      sx={{
        height: "100%"
      }}
    >
      <Stack
        direction="column"
        sx={{
          width: 500,
          height: "100%"
        }}
      >
        {status.inProgress ? (
          <Box>
            <CurrentProgress status={status}/>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              height: "100%",
              borderRadius: 0,
              border: "1px solid grey",
              scrollbarWidth: "thin",
              boxShadow: "none",
            }}
          >
            <Table stickyHeader>
              <TableHead
                sx={{
                  borderBottom: "1px solid grey",
                }}
              >
                <TableRow
                  sx={{
                    width: 50,
                  }}
                >
                  <TableCell
                    sx={{
                      backgroundColor: theme.palette.secondary.main,
                      borderBottom: "1px solid grey",
                      // width: 50,
                      fontWeight: "bold",
                    }}
                  >
                    Filename
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: theme.palette.secondary.main,
                      borderBottom: "1px solid grey",
                      fontWeight: "bold",
                    }}
                  >
                    Size
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: theme.palette.secondary.main,
                      borderBottom: "1px solid grey",
                      fontWeight: "bold",
                    }}
                  >
                    Usage
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filenames.map((e, i) => {
                  return (
                    <Tooltip key={`file_table_row_${i}_tooltip`} title={e.name} placement="right">
                      <TableRow
                        key={`file_table_row_${i}_row`}
                        selected={e.id === selectedFile}
                        onClick={() => setSelectedFile(e.id)}
                        sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: (theme) => theme.palette.action.hover,
                            },
                        }}
                      >
                        <TableCell
                          key={`file_table_row_${i}_cell_label`}
                        >
                          <Typography
                            key={`file_table_row_${i}_cell_label_text`}
                            sx={{
                              fontSize: theme.typography.fontSize,
                              textOverflow: "ellipsis",
                              overflow: "clip",
                              // width: 200,
                              textWrap: "nowrap",
                            }}
                          >
                            {e.name}
                          </Typography>
                        </TableCell>
                        <TableCell
                          key={`file_table_row_${i}_cell_size`}
                        >{formatFileSize(e.fileSize)}</TableCell>
                        <TableCell
                          key={`file_table_row_${i}_cell_usage`}
                        >
                          {e.id === activeFile ? "In-use" : "Available"}
                        </TableCell>
                      </TableRow>
                    </Tooltip>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
      
      <Stack
        direction="row"
        columnGap={1}
        sx={{
          width: "100%",
          justifyContent: "end"
        }}
      >
        <Button
          variant="contained"
          color="secondary"
        >
          Delete file
        </Button>
        
        <Button
          variant="contained"
          color="secondary"
        >
          Copy file
        </Button>
        
        <Button
          variant="contained"
          color="secondary"
          onClick={() => { 
            router.push("/files/" + selectedFile);
            router.refresh();
            // dispatch(reset(true));
          }}
        >
          Open file
        </Button>

      </Stack>
      
    </Stack>
  );
  
}