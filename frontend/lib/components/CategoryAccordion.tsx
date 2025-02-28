// import { RootState } from "@reduxjs/toolkit/query";
import { useAppDispatch, useAppSelector } from "../redux/hooks/hooks";
import { Accordion, AccordionDetails, AccordionSummary, Button, CircularProgress, Divider, Stack, Tooltip, Typography } from "@mui/material";
import { RootState } from "../redux/stores/store";
import { setObs, setSelectedCategory } from "../redux/reducers/plotReducer";
import { Square } from "@mui/icons-material";
import { my_colors } from "./scatterplot";
import { useState } from "react";
import { theme } from "@/app/layout";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

async function fetchFileObs(
  fileID: string,
  obs: string | null,
  callback: Function
) {
  const request = `${BACKEND_ENDPOINT}/get_file_obs?file_id=${fileID}&obs=${obs}`;

  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("something fucky happened");
      }
      return response.json();
    })
    .then((data) => {
      callback(setObs(JSON.parse(data)));
    })
    .catch((error) => {
      console.error("something fucky", error);
    });
}

// const useStyles = makeStyles(() => ({
//   expanded: {},
//   content: {
//     "&$expanded": {
//       marginBottom: 0,
//     },
//   },
// }));

export default function CategoryAccordion() {
  
  const fileID = useAppSelector((state: RootState) => state.fileReducer.activeFile);
  
  const obsm = useAppSelector((state: RootState) => state.plotReducer.obsm);
  const hierarchy = useAppSelector((state: RootState) => state.plotReducer.hierarchy);
  
  const selectedCategory = useAppSelector((state: RootState) => state.plotReducer.selectedCategory);
  const selectedEmbedding = useAppSelector((state: RootState) => state.plotReducer.selectedEmbedding);
  
  const labelSize = useAppSelector((state: RootState) => state.plotReducer.labelSize);

  
  const obs = useAppSelector((state: RootState) => state.plotReducer.obs);
  
  const dispatch = useAppDispatch();
  
  // const [selectedCategory, setSelectedCategory] = useState("");
  const [expanded, setExpanded] = useState(false);
  
  // const classes = useStyles();
  
  return (
    <>
      <Stack direction="column">
        {hierarchy ? (
          [...hierarchy.obs]
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .map((e) => {
              return (
                <Accordion
                  key={"accordion_" + e}
                  expanded={selectedCategory === e && expanded}
                  disabled={selectedEmbedding === "" || obsm === null}
                  disableGutters
                  sx={{
                    backgroundColor: theme.palette.grey[100],
                    "& .Mui-disabled": {
                      // color: "red",
                      // border: undefined,
                      boxShadow: undefined,
                    },
                    "& .MuiPaper-root": {
                      boxShadow: undefined,
                    },
                    "& .MuiContainer-root": {
                      boxShadow: undefined,
                    },
                    "& .MuiAccordion-root": {
                      boxShadow: undefined,
                    },
                  }}
                >
                  <AccordionSummary
                    key={"accordion_summary_" + e}
                    sx={{
                      minHeight: 0,
                      padding: 1,
                      boxShadow: undefined,
                      // all: "initial",
                      "& .MuiAccordionSummary-content": {
                        margin: 0,
                        // alignSelf: "start"
                      },
                      "& .Mui-disabled": {
                        // color: "red",
                        // border: undefined,
                        boxShadow: undefined,
                      },
                      overflow: "hidden",
                      textOverflow: "clip",
                      justifyContent: "flex-start",
                      borderWidth: "2px",
                      ":hover": {
                        opacity: 0.5,
                        transition: "ease-in-out 0.1s",
                      },
                    }}
                    onClick={() => {
                      if (selectedCategory !== e) {
                        setExpanded(true);
                        
                        dispatch(setSelectedCategory(e));
                        fetchFileObs(fileID, e, dispatch);
                      }
                      else {
                        setExpanded(!expanded);
                      }
                    }}
                  >
                    <Typography
                      key={"accordion_summary_text" + e}
                      // justifySelf="start"
                      variant="subtitle2"
                      fontWeight={selectedCategory === e ? "bold": ""}
                    >
                      {e}
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails
                    key={"accordion_details_" + e}
                    sx={{
                      padding: 1,
                      paddingTop: 0,
                    }}
                  >
                    <Stack
                      key={"accordion_details_stack" + e}
                      height={200}
                      sx={{
                        overflowY: "scroll",
                        scrollbarWidth: "thin"
                      }}
                    >
                      {obs && selectedCategory === e ? (
                        [...obs.labels]
                        // .sort((a, b) => {
                        //   if (labelSize[a] && labelSize[b]) {
                        //     return labelSize[b] - labelSize[a];
                        //   }
                        //   return 0
                        // })
                        .map((label, i) => {
                          let label_color = my_colors[i % my_colors.length];

                          return (
                            <Tooltip
                              key={"label_tooltip" + label}
                              title={label}
                              placement="right"
                              enterDelay={1000}
                              // leaveDelay={2000}
                            >
                              <Button
                                disableRipple
                                sx={{ all: "initial" }}
                                size="small"
                                onClick={() => {
                                  const canvas = document.getElementById(
                                    "points_" + label
                                  );

                                  canvas!!.style.zIndex = "8";

                                  obs!!.labels.forEach(
                                    (label_temp, index_other) => {
                                      if (label !== label_temp) {
                                        const otherCanvas =
                                          document.getElementById(
                                            "points_" + label_temp
                                          );
                                        otherCanvas!.style.opacity = "0%";
                                      }
                                    }
                                  );
                                }}
                                onMouseEnter={() => {
                                  const canvas = document.getElementById(
                                    "points_" + label
                                  );

                                  canvas!!.style.zIndex = "8";

                                  obs!!.labels.forEach(
                                    (label_temp, index_other) => {
                                      if (label !== label_temp) {
                                        const otherCanvas =
                                          document.getElementById(
                                            "points_" + label_temp
                                          );
                                        otherCanvas!.style.filter =
                                          "grayscale(1)";
                                      }
                                    }
                                  );
                                }}
                                onMouseLeave={() => {
                                  const canvas = document.getElementById(
                                    "points_" + label
                                  );

                                  canvas!!.style.zIndex = "5";

                                  obs!!.labels.forEach(
                                    (label_temp, index_other) => {
                                      if (label !== label_temp) {
                                        const otherCanvas =
                                          document.getElementById(
                                            "points_" + label_temp
                                          );
                                        otherCanvas!.style.filter =
                                          "grayscale(0)";
                                        otherCanvas!.style.opacity = "100%";
                                      }
                                    }
                                  );
                                }}
                              >
                                <Stack
                                  key={"label_stack" + label}
                                  direction="row"
                                  alignItems="center"
                                  justifyContent="left"
                                  // width="fit-content"
                                >
                                  <Square
                                    key={"label_square" + label}
                                    sx={{
                                      width: 22,
                                      height: 22,
                                      marginRight: 1,
                                      color: label_color,
                                    }}
                                  />
                                  <Typography
                                    key={"label_typography" + label}
                                    variant="subtitle2"
                                    // noWrap
                                    // width=""
                                    // textOverflow="ellipsis"
                                    // overflow="hidden"
                                    color={label_color}
                                  >
                                    {label}
                                    {
                                      labelSize[label]
                                      ? ` (${labelSize[label].toLocaleString(undefined, { minimumIntegerDigits: 3 })})`
                                      : ""
                                    }
                                  </Typography>
                                </Stack>
                              </Button>
                            </Tooltip>
                          );
                        })
                      ) : (
                        <CircularProgress />
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })
        ) : (
          <CircularProgress/>
        )}
      </Stack>
    </>
  )
  
}