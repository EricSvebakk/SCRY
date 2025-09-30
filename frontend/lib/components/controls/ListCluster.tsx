import { Box, Button, Checkbox, Grid, Stack, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { AnndataIndices } from "../../types";
import CurrentProgress from "../OverlayCurrentProgress";
import { setSelectedClusters } from "@/lib/redux/reducers/plotReducer";
import { useEffect, useState } from "react";
import { theme } from "@/app/layout";
import ButtonSecondary from "../custom/ButtonSecondary";
import { Square } from "@mui/icons-material";
import { sequentialScaleColorOptions } from "@/lib/design";

export function ListCluster(props: {
  canvasID: string
}) {
  
  const config = useAppSelector((state) => state.plotReducer.plot.cluster);
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs);
  const status = useAppSelector((state) => state.plotReducer.statusBackend.fileObs);
  const selectedClusters = useAppSelector((state) => state.plotReducer.filtering.selected.clusters);

  const dispatch = useAppDispatch();
  const [isInverted, setIsInverted] = useState<boolean>(false);

  useEffect(() => {
    if (obs.indices) {
      (obs.indices.categories as string[]).forEach((label_temp: string, index_other) => {
        const otherCanvas = document.getElementById(`canvas_${props.canvasID}_${label_temp}`);

        if (otherCanvas === null) {
          return;
        }
        
        if (selectedClusters.includes(label_temp)) {
          otherCanvas!.style.opacity = "100%";
        } else {
          otherCanvas!.style.opacity = "0%";
        }
      });
    }
  }, [obs.indices, selectedClusters, isInverted]);

  useEffect(() => {
    if (obs.indices && selectedClusters.length === 0) {
      dispatch(setSelectedClusters(obs.indices.categories as string[]));
    }
  }, [obs.indices]);
  
  const palette =  sequentialScaleColorOptions[config.palette]

  return (
    <Stack
      direction="column"
      sx={{
        height: "98vh",
        width: "100%",
        backgroundColor: config.background ? config.background : theme.palette.background.paper,
        border: "1px solid grey",
        borderLeft: "none",
      }}
    >
      <Stack
        direction="row"
        sx={{
          height: 32,
          borderBottom: "1px solid grey",
          borderLeft: "1px solid grey"
        }}
      >
        <ButtonSecondary
          title={ isInverted ? "Inverted" : "Normal"}
          onClick={() => {
            setIsInverted(!isInverted);
          }}
        />

        <ButtonSecondary
          title={ selectedClusters.length > 0 ? "Hide all" : "Show all" }
          onClick={() => {
            if (obs.indices) {
              if (selectedClusters.length > 0) {
                dispatch(setSelectedClusters([]));
              } else {
                dispatch(setSelectedClusters(obs.indices?.categories as string[]));
              }
            }
          }}
        />
      </Stack>

      {status.inProgress ? (
        <CurrentProgress status={status} />
      ) : (
        <Stack
          className="legend_sequential"
          sx={{
            height: "100%",
            overflowY: "auto",
            p: 1
          }}
        >
          {(obs.indices?.categories as string[])?.map((label, i) => {
            let label_color = palette[i % palette.length];
            const isSelected = selectedClusters.includes(label);

            return (
              <Button
                key={"button_" + label}
                disableRipple
                sx={{
                  all: "initial",
                  cursor: "pointer",
                }}
                size="small"
                fullWidth
                onClick={() => {
                  const newSelectedClusters = isSelected
                    ? selectedClusters.filter((e) => e !== label)
                    : [...selectedClusters, label];

                  dispatch(setSelectedClusters(newSelectedClusters));
                }}
                onMouseEnter={() => labelOnMouseEnter(label, obs.indices!, props.canvasID, isInverted)}
                onMouseLeave={() => labelOnMouseLeave(label, obs.indices!, props.canvasID, isInverted, selectedClusters)}
              >
                <Grid
                  container
                  direction="row"
                  width="100%"
                  sx={{
                    alignItems: "center",
                  }}
                >
                  <Grid item width="100%" xs>
                    <Stack direction="row" justifyContent="space-between">
                      <Stack
                        key={"label_stack_" + label}
                        direction="row"
                        alignItems="center"
                        justifyContent="left"
                      >
                        <Square
                          key={"label_square_" + label}
                          sx={{
                            width: 22,
                            height: 22,
                            marginRight: 1,
                            color: label_color,
                          }}
                        />
                        <Typography
                          key={"label_typography_" + label}
                          color={label_color}
                          fontSize={theme.typography.fontSize}
                        >
                          {label}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid item>
                    <Checkbox
                      checked={selectedClusters.includes(label)}
                      size="small"
                      sx={{
                        p: 0,
                      }}
                    />
                  </Grid>
                </Grid>
              </Button>
            );
          })}

          {!obs.indices ? (
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                alignContent: "center",
                justifyItems: "center",
              }}
            >
              <Typography fontSize={theme.typography.fontSize}>
                No clustering selected
              </Typography>
            </Box>
          ) : (
            <></>
          )}
        </Stack>
      )}
    </Stack>
  );
}

function labelOnMouseEnter(label: string, indicies: AnndataIndices, canvasID: string, isInverted: boolean) {
  const canvas = document.getElementById(`canvas_${canvasID}_${label}`);

  if (canvas === null) {
    return;
  }
  
  canvas!.style.zIndex = "8";
  
  if (isInverted) {
    canvas!.style.opacity = "100%";
  }

  indicies.categories.forEach((tempLabel, tempIndex) => {
    if (label !== tempLabel) {
      const otherCanvas = document.getElementById(`canvas_${canvasID}_${tempLabel}`);
      otherCanvas!.style.filter = "grayscale(1)";
      
    }
  });
}

function labelOnMouseLeave(label: string, indices: AnndataIndices, canvasID: string, isInverted: boolean, selected: string[]) {
  const canvas = document.getElementById(`canvas_${canvasID}_${label}`);

  if (canvas === null) {
    return;
  }
  
  canvas!.style.zIndex = "5";
  
  if (isInverted && !selected.includes(label)) {
    canvas!.style.opacity = "0%";
  }

  indices.categories.forEach((tempLabel, tempIndex) => {
    if (label !== tempLabel) {
      const otherCanvas = document.getElementById(`canvas_${canvasID}_${tempLabel}`);
      otherCanvas!.style.filter = "grayscale(0)";
    }
  });
}
