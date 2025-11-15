import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { theme } from "@/lib/design";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import CurrentProgress from "../../OverlayCurrentProgress";
import formatFileSize from "@/lib/util/formatFileSize";
import { useParams, useRouter } from "next/navigation";
import { Folder } from "@mui/icons-material";
import { reset } from "@/lib/redux/reducers/plotReducer";

export default function PanelFiles(props: { sx?: SxProps }) {
  
  const fileID = useAppSelector((state) => state.plotReducer.system.files.active);
  const filenames = useAppSelector((state) => state.plotReducer.system.files.all);
  const status = useAppSelector(
    (state) => state.plotReducer.statusBackend.fileFeatureCoordinates
  );

  const [openPanelFiles, setOpenPanelFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  const { screenID } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  return (
    <>
      <Button
        fullWidth
        sx={{
          ...props.sx,
        }}
        onClick={() => {
          setOpenPanelFiles(!openPanelFiles);
        }}
      >
        <Stack
          direction="column"
          sx={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Folder />
          <Typography fontSize={theme.typography.subtitle1.fontSize}>
            View files
          </Typography>
        </Stack>
      </Button>

      <Dialog open={openPanelFiles} onClose={() => setOpenPanelFiles(false)}>
        <DialogTitle>
          <Typography>View files</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Grid
            container
            direction="column"
            height="100%"
            rowGap={1}
            sx={{
              p: 1,
            }}
          >
            <Grid item>
              {status.inProgress ? (
                <Box
                  sx={{
                    height: 500,
                  }}
                >
                  <CurrentProgress status={status} />
                </Box>
              ) : (
                <TableContainer
                  component={Paper}
                  sx={{
                    width: 550,
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
                        // width: 50,
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
                      {[...filenames]
                      .sort((a,b) => a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase()))
                      .map((e, i) => {
                        return (
                          <Tooltip
                            key={`file_table_row_${i}_tooltip`}
                            title={e.name}
                            placement="right"
                          >
                            <TableRow
                              key={`file_table_row_${i}_row`}
                              // selected={e.id === selectedFile}
                              onClick={() => setSelectedFile(e.id)}
                              sx={{
                                cursor: "pointer",
                                backgroundColor: e.id === selectedFile
                                  ? theme.palette.action.selected
                                  : "",
                                "&:hover": {
                                  backgroundColor: theme.palette.action.hover,
                                },
                              }}
                            >
                              <TableCell key={`file_table_row_${i}_cell_label`}>
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
                              <TableCell key={`file_table_row_${i}_cell_size`}>
                                {formatFileSize(e.fileSize)}
                              </TableCell>
                              <TableCell key={`file_table_row_${i}_cell_usage`}>
                                {e.id === fileID ? "In-use" : ""}
                              </TableCell>
                            </TableRow>
                          </Tooltip>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Grid>

            <Grid item>
              <Stack
                direction="row"
                columnGap={1}
                sx={{
                  width: "100%",
                  justifyContent: "end",
                }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  // fullWidth
                  disabled
                >
                  Delete file
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  // fullWidth
                  disabled
                >
                  Copy file
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  // fullWidth
                  onClick={() => {
                    router.push(`/files/${selectedFile}/${screenID}`);
                    router.refresh();
                    dispatch(reset(true))
                  }}
                >
                  Open file
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
}
