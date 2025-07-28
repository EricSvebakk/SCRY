import { Button, Checkbox, Grid, Stack } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { my_colors } from "../ScatterPlotGenerator";
import { AnndataIndices } from "../../types";
import { LabelListItem } from "../LabelListItem";
import CurrentProgress from "../OverlayCurrentProgress";
import { setSelectedClusters } from "@/lib/redux/reducers/plotReducer";
import { useEffect } from "react";

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
        height: "30vh",
        width: "100%",
      }}
    >
      <Stack
        sx={{
          overflowY: "auto",
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
                  />
                </Grid>
              </Grid>
            </Button>
          );
        })}
      </Stack>

      <Stack direction="row">
        <Button
          onClick={() => {
            if (obs.indices) {
              dispatch(setSelectedClusters(obs.indices?.categories));
            }
          }}
        >
          Select all
        </Button>
        <Button
          onClick={() => {
            if (obs.indices) {
              dispatch(setSelectedClusters([]));
            }
          }}
        >
          Deselect all
        </Button>
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
