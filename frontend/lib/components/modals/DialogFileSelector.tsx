
"use client"

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { theme } from "@/app/layout";
import { get_filenames } from "@/lib/fetch/get_filenames";
import CurrentProgress from "../OverlayCurrentProgress";
import { useRouter } from "next/navigation";
import { reset } from "@/lib/redux/reducers/plotReducer";

function formatFileSize(value: number) {
  if (value === 0) {
    return "0   B";
  }

  const suffixes = ["KB", "MB", "GB"];

  const ceilLogSize = Math.ceil(Math.log10(value) / 4);
  const fileSize = value * (1 / 1024) ** ceilLogSize;
  const fileSizeResult = fileSize.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return fileSizeResult + " " + suffixes[ceilLogSize - 1];
}

export default function DialogFileSelctor(props: {
  isOpen: boolean;
  setIsOpen: Function;
}) {
  
  const status = useAppSelector((state) => state.plotReducer.status.get_filenames);
  const filenames = useAppSelector((state) => state.fileReducer.files);
  const activeFile = useAppSelector((state) => state.fileReducer.activeFile);
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  useEffect(() => {
    get_filenames(dispatch);
  }, [filenames.length])

  return (
    <Dialog
      open={props.isOpen}
      onClose={() => props.setIsOpen(false)}
      maxWidth="md"
    >
      <DialogTitle>Select File</DialogTitle>
      <DialogContent
        sx={{
          p: 2,
          width: 600,
          maxWidth: 600,
          overflow: "hidden",
        }}
      >
        
        
        {status.inProgress ? (
          <Box
            sx={{
              height: 500,
            }}
          >
            <CurrentProgress status={status}/>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              height: 500,
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
                  width: 50,
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
                      width: 50,
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
                    Select
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filenames.map((e) => {
                  return (
                    <Tooltip title={e.name} placement="right">
                      <TableRow>
                        <TableCell>
                          <Typography
                            sx={{
                              fontSize: theme.typography.fontSize,
                              textOverflow: "ellipsis",
                              overflow: "clip",
                              width: 200,
                              textWrap: "nowrap",
                            }}
                          >
                            {e.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatFileSize(e.fileSize)}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            disabled={e.id === activeFile}
                            onClick={() => { 
                              dispatch(reset(true));
                              router.push("/files/" + e.id);
                             }}
                          >
                            Open
                          </Button>
                        </TableCell>
                      </TableRow>
                    </Tooltip>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}
