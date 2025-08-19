import { Box, Button, Checkbox, Grid, Stack, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { my_colors } from "../ScatterPlotGenerator";
import { AnndataIndices } from "../../types";
import CurrentProgress from "../OverlayCurrentProgress";
import { setSelectedClusters } from "@/lib/redux/reducers/plotReducer";
import { useEffect } from "react";
import { theme } from "@/app/layout";
import ButtonSecondary from "../custom/ButtonSecondary";
import { Square } from "@mui/icons-material";

export function ListCluster() {
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs);
  const status = useAppSelector(
    (state) => state.plotReducer.status.get_file_obs
  );
  const selectedClusters = useAppSelector(
    (state) => state.plotReducer.filtering.selected.clusters
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (obs.indices) {
      obs.indices.categories.forEach((label_temp, index_other) => {
        const otherCanvas = document.getElementById("points_" + label_temp);

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
  }, [obs.indices, selectedClusters]);

  useEffect(() => {
    if (obs.indices && selectedClusters.length === 0) {
      dispatch(setSelectedClusters(obs.indices.categories));
    }
  }, [obs.indices]);

  return (
    <Stack
      direction="column"
      sx={{
        height: "98vh",
        width: "100%",
        backgroundColor: theme.palette.background.paper,
        border: "1px solid grey",
        borderLeft: "none",
      }}
    >
      <Stack
        direction="row"
        sx={{
          height: 32,
          backgroundColor: theme.palette.secondary.main,
          borderBottom: "1px solid grey",
          borderLeft: "1px solid grey"
        }}
      >
        <ButtonSecondary
          title="Show all"
          onClick={() => {
            if (obs.indices) {
              dispatch(setSelectedClusters(obs.indices?.categories));
            }
          }}
        />

        <ButtonSecondary
          title="Hide all"
          onClick={() => {
            if (obs.indices) {
              dispatch(setSelectedClusters([]));
            }
          }}
        />
      </Stack>

      {status.inProgress ? (
        <CurrentProgress status={status} />
      ) : (
        <Stack
          sx={{
            height: "100%",
            overflowY: "auto",
            // p: "1vh",
            backgroundColor: theme.palette.background.paper,
            // border: "1px solid green",
          }}
        >
          {obs.indices?.categories.map((label, i) => {
            let label_color = my_colors[i % my_colors.length];

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
                  const newSelectedClusters = selectedClusters.includes(label)
                    ? selectedClusters.filter((e) => e !== label)
                    : [...selectedClusters, label];

                  dispatch(setSelectedClusters(newSelectedClusters));
                }}
                onMouseEnter={() => labelOnMouseEnter(label, obs.indices!)}
                onMouseLeave={() => labelOnMouseLeave(label, obs.indices!)}
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
                // border: "1px solid yellow",
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

function labelOnMouseEnter(label: string, indicies: AnndataIndices) {
  const canvas = document.getElementById("points_" + label);

  if (canvas === null) {
    return;
  }
  
  canvas!.style.zIndex = "8";

  indicies.categories.forEach((label_temp, index_other) => {
    if (label !== label_temp) {
      const otherCanvas = document.getElementById("points_" + label_temp);
      otherCanvas!.style.filter = "grayscale(1)";
    }
  });
}

function labelOnMouseLeave(label: string, indices: AnndataIndices) {
  const canvas = document.getElementById("points_" + label);

  if (canvas === null) {
    return;
  }
  
  canvas!.style.zIndex = "5";

  indices.categories.forEach((label_temp, index_other) => {
    if (label !== label_temp) {
      const otherCanvas = document.getElementById("points_" + label_temp);
      otherCanvas!.style.filter = "grayscale(0)";
    }
  });
}
