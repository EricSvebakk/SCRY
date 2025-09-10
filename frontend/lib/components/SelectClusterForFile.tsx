import { KeyboardArrowLeft, KeyboardArrowRight, KeyboardDoubleArrowLeft, KeyboardDoubleArrowRight } from "@mui/icons-material";
import { Box, Button, Grid, IconButton, Stack, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/hooks/hooks";
import { theme } from "@/app/layout";
import { setAnndataField } from "../redux/reducers/plotReducer";
import { useState } from "react";
import { get_file_obs } from "../fetch/get_file_obs";
import CurrentProgress from "./OverlayCurrentProgress";

export default function SelectClusterForFile() {
  
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs);
  const activeFile = useAppSelector((state) => state.fileReducer.activeFile);
  const statusHierarchy = useAppSelector((state) => state.plotReducer.status.get_file_hierarchy);
  const statusObs = useAppSelector((state) => state.plotReducer.status.get_file_obs);
  
  const dispatch = useAppDispatch();
  
  const [selectedLeft, setSelectedLeft] = useState<string[]>([]);
  const [selectedRight, setSelectedRight] = useState<string[]>([]);
  const [activeObs, setActiveObs] = useState<string[]>([]);
  
  return (
    <Stack
      direction="column"
      rowGap={1}
      sx={{
        height: "100%"
      }}
    >
      <Grid
        container
        direction="row"
        columnGap={1}
        sx={{
          width: "100%",
          height: "94vh",
          border: "1px solid grey",
          backgroundColor: theme.palette.secondary.main,
          p: "1vh",
        }}
      >
        <Grid
          item
          xs
          sx={{
            height: "100%",
            border: "1px solid grey",
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "thin",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          
          {obs.keys && !statusHierarchy.inProgress ? (
            [...obs.keys]
              .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
              .map((e) => {
                const isDisabled = obs.selectedKey === e;
  
                return (
                  <Button
                    key={"accordion_" + e}
                    size="small"
                    variant="text"
                    disabled={isDisabled}
                    fullWidth
                    sx={{
                      color: theme.palette.text.secondary,
                      backgroundColor: obs.selectedKey === e ? theme.palette.action.selected : "",
                      justifyContent: "start",
                      overflowX: "clip",
                      fontWeight: obs.selectedKey === e ? "bold" : "",
                      textTransform: "initial",
                      fontSize: theme.typography.fontSize,
                      "&:disabled": {
                        cursor: "not-allowed",
                        pointerEvents: "all !important",
                      },
                    }}
                    onClick={() => {
                      dispatch(
                        setAnndataField({
                          attribute: "obs",
                          field: "selectedKey",
                          value: e,
                        })
                      );

                      get_file_obs(activeFile, e, dispatch);
                    }}
                  >
                    <Stack
                      direction="row"
                      sx={{
                        width: "100%",
                        justifyContent: "space-between"
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: theme.typography.fontSize,
                        }}
                      >
                        {e}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: theme.typography.fontSize,
                        }}
                      >
                        {/* X */}
                      </Typography>
                    </Stack>
                  </Button>
                );
              })
          ) : (
            <Box
              sx={{
                height: "100%",
                width: "100%",
                alignContent: "center",
                justifyItems: "center"
              }}
            >
              <CurrentProgress status={statusHierarchy}/>
            </Box>
          )}
        </Grid>
        
        <Grid
          item
          xs
          sx={{
            height: "100%",
            border: "1px solid grey",
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "thin",
            backgroundColor: theme.palette.background.paper,
            
          }}
        >
          {/* {!obs.indices ? (
            <Box
              sx={{
                // position: "absolute",
                width: "100%",
                height: "100%",
                // border: "1px solid yellow",
                alignContent: "center",
                justifyItems: "center",
                overflowY: "hidden",
              }}
            >
              <Typography fontSize={theme.typography.fontSize}>
                No Observation selected
              </Typography>
            </Box>
          ) : (
            <></>
          )} */}
          
          {obs.indices && !statusObs.inProgress ? (
            (obs.indices.categories as string[]).filter((key) => !activeObs.includes(key)).map((key) => {
              const isDisabled = obs.selectedKey === key;
              const isSelected = selectedLeft.includes(key);
              
              
              return (
  
                <Button
                  key={"accordion_" + key}
                  size="small"
                  variant="text"
                  disabled={isDisabled}
                  fullWidth
                  sx={{
                    color: theme.palette.text.secondary,
                    backgroundColor: isSelected ? theme.palette.action.selected : "",
                    justifyContent: "start",
                    overflowX: "clip",
                    fontWeight: obs.selectedKey === key ? "bold" : "",
                    textTransform: "initial",
                    fontSize: theme.typography.fontSize,
                    "&:disabled": {
                      cursor: "not-allowed",
                      pointerEvents: "all !important",
                    },
                  }}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedLeft(selectedLeft.filter((e) => e !== key));
                    } else {
                      setSelectedLeft([...selectedLeft, key]);
                    }
                  }}
                >
                  <Stack
                    direction="row"
                    sx={{
                      width: "100%",
                      justifyContent: "space-between"
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: theme.typography.fontSize,
                      }}
                    >
                      {key}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: theme.typography.fontSize,
                      }}
                    >
                      {/* X */}
                    </Typography>
                  </Stack>
                </Button>
              );
              })
            
          ) : (
            <Box
              sx={{
                height: "100%",
                width: "100%",
                alignContent: "center",
                justifyItems: "center"
              }}
            >
              <CurrentProgress status={statusObs}/>
            </Box>
          ) }
        </Grid>
        
        <Grid
          item
          sx={{
            backgroundColor: theme.palette.secondary.main
          }}
        >
          <Stack
            direction="column"
            sx={{
              height: "100%",
              justifyContent: "center",
            }}
          >
            <IconButton
              disabled={(((obs.indices?.categories.length) ?? 0) - activeObs.length) <= 0}
              onClick={() => {
                setActiveObs([...activeObs, ...selectedLeft]);
                setSelectedLeft([]);
              }}
            >
              <KeyboardArrowRight/>
            </IconButton>
            
            <IconButton
              disabled={(((obs.indices?.categories.length) ?? 0) - activeObs.length) <= 0}
              onClick={() => {
                if (obs.indices?.categories) {
                  setActiveObs(obs.indices?.categories as string[]);
                }
              }}
            >
              <KeyboardDoubleArrowRight/>
            </IconButton>
            
            <IconButton
              disabled={activeObs.length === 0}
              onClick={() => {
                setActiveObs([]);
              }}
            >
              <KeyboardDoubleArrowLeft/>
            </IconButton>
            
            <IconButton
              disabled={activeObs.length === 0}
              onClick={() => {
                setActiveObs(activeObs.filter((e) => !selectedRight.includes(e)));
                setSelectedRight([]);
              }}
            >
              <KeyboardArrowLeft/>
            </IconButton>
          </Stack>
        </Grid>
        
        <Grid
          item
          xs
          direction="column"
          sx={{
            // height: "92vh",
            height: "100%",
            border: "1px solid grey",
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "thin",
            backgroundColor: theme.palette.background.paper
          }}
        >
          {activeObs.map((key) => {
            const isDisabled = obs.selectedKey === key;
            const isSelected = selectedRight.includes(key);
            
            return (

              <Button
                key={"accordion_" + key}
                size="small"
                variant="text"
                disabled={isDisabled}
                fullWidth
                sx={{
                  color: theme.palette.text.secondary,
                  backgroundColor: isSelected ? theme.palette.action.selected : "",
                  justifyContent: "start",
                  overflowX: "clip",
                  fontWeight: obs.selectedKey === key ? "bold" : "",
                  textTransform: "initial",
                  fontSize: theme.typography.fontSize,
                  "&:disabled": {
                    cursor: "not-allowed",
                    pointerEvents: "all !important",
                  },
                }}
                onClick={() => {
                  if (isSelected) {
                    setSelectedRight(selectedRight.filter((e) => e !== key));
                  } else {
                    setSelectedRight([...selectedRight, key]);
                  }
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    width: "100%",
                    justifyContent: "space-between"
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: theme.typography.fontSize,
                    }}
                  >
                    {key}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: theme.typography.fontSize,
                    }}
                  >
                    {/* X */}
                  </Typography>
                </Stack>
              </Button>
            );
            })
          }
        </Grid>
      </Grid>
      
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
          Delete unselected
        </Button>
        
        <Button
          variant="contained"
          color="secondary"
        >
          Save selected as file
        </Button>
        
      </Stack>
    </Stack>
  );
  
}