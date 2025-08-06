import { Box, Button, Checkbox, Grid, Stack, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { my_colors } from "../ScatterPlotGenerator";
import { AnndataIndices } from "../../types";
import { LabelListItem } from "../LabelListItem";
import CurrentProgress from "../OverlayCurrentProgress";
import { setSelectedClusters } from "@/lib/redux/reducers/plotReducer";
import { useEffect } from "react";
import { theme } from "@/app/layout";
import ButtonSecondary from "../custom/ButtonSecondary";

export function ListLabelOptions() {
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

        if (selectedClusters.includes(label_temp)) {
          otherCanvas!.style.opacity = "100%";
        } else {
          otherCanvas!.style.opacity = "0%";
        }
      });
    }
  }, [obs.indices, selectedClusters]);

  useEffect(() => {
    if (obs.indices) {
      dispatch(setSelectedClusters(obs.indices.categories));
    }
  }, [obs.indices]);

  if (status.inProgress) {
    return <CurrentProgress status={status} />;
  }

  return (
    <Stack
      direction="column"
      sx={{
        height: "98vh",
        width: "100%",
        backgroundColor: theme.palette.background.paper,
        border: "1px solid grey",
      }}
    >
      <Stack
        direction="row"
        sx={{
          borderBottom: "1px solid grey",
        }}
      >
        <ButtonSecondary
          title="Select all"
          onClick={() => {
            if (obs.indices) {
              dispatch(setSelectedClusters(obs.indices?.categories));
            }
          }}
        />

        <ButtonSecondary
          title="Deselect all"
          onClick={() => {
            if (obs.indices) {
              dispatch(setSelectedClusters([]));
            }
          }}
        />
      </Stack>

      <Stack
        sx={{
          height: "100%",
          overflowY: "auto",
          p: "1vh",
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
                  <LabelListItem
                    key={"label_" + label}
                    label={label}
                    label_color={label_color}
                  />
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
            <Typography>No clustering selected</Typography>
          </Box>
        ) : (
          <></>
        )}
      </Stack>
    </Stack>
  );
}

function labelOnMouseEnter(label: string, indicies: AnndataIndices) {
  const canvas = document.getElementById("points_" + label);

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

  canvas!.style.zIndex = "5";

  indices.categories.forEach((label_temp, index_other) => {
    if (label !== label_temp) {
      const otherCanvas = document.getElementById("points_" + label_temp);
      otherCanvas!.style.filter = "grayscale(0)";
    }
  });
}
