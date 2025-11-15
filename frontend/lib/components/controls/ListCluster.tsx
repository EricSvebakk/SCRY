import { Box, Button, Checkbox, Grid, Stack, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import CurrentProgress from "../OverlayCurrentProgress";
import { setSelectedClusters } from "@/lib/redux/reducers/plotReducer";
import { useEffect } from "react";
import { theme } from "@/lib/design";
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
  
  const allClusters = obs.indices ? obs.indices.categories as string[] : [];
  
  const dispatch = useAppDispatch();

  // Resets selected clusters when new data loads in
  useEffect(() => {
    dispatch(setSelectedClusters(allClusters));
  }, [obs.indices]);
  
  const palette =  sequentialScaleColorOptions[config.palette]

  return (
    <Stack
      direction="column"
      className="test_class"
      sx={{
        height: "98vh",
        width: "100%",
        backgroundColor: config.background
          ? config.background
          : theme.palette.background.paper,
      }}
    >
      <Stack
        direction="row"
        sx={{
          backgroundColor: theme.palette.secondary.main,
          height: 32,
          minHeight: 32,
          maxHeight: 32,
          borderBottom: "1px solid grey",
          borderLeft: "1px solid grey",
        }}
      >
        <ButtonSecondary
          title="Show all"
          onClick={() => {
            if (!obs.indices) {
              return;
            }

            const allClusters = obs.indices.categories as string[];
            dispatch(setSelectedClusters(allClusters));
            
            allClusters.forEach((label_temp: string) => {
              const otherCanvas = document.getElementById(`canvas_${props.canvasID}_${label_temp}`);
              if (otherCanvas === null) {
                return;
              }
              otherCanvas!.style.opacity = "100%";
            });
          }}
        />

        <ButtonSecondary
          title="Hide all"
          onClick={() => {
            dispatch(setSelectedClusters([]));

            allClusters.forEach((label_temp: string) => {
              const otherCanvas = document.getElementById(`canvas_${props.canvasID}_${label_temp}`);
              if (otherCanvas === null) {
                return;
              }
              otherCanvas!.style.opacity = "0%";
            });
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
            p: 1,
          }}
        >
          {obs.indices ? (
            (obs.indices.categories as string[])?.map((label, i) => (
              <ButtonToggleCluster
                key={`button_toggle_cluster_${i}`}
                label={label}
                index={i}
                selectedClusters={selectedClusters}
                allClusters={obs.indices!.categories as string[]}
                canvasID={props.canvasID}
                palette={palette}
              />
            ))
          ) : (
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
                No observation selected
              </Typography>
            </Box>
          )}
        </Stack>
      )}
    </Stack>
  );
}

function ButtonToggleCluster(props: {
  label: string;
  index: number;
  selectedClusters: string[];
  allClusters: string[];
  canvasID: string;
  palette: any[];
}) {
  
  const dispatch = useAppDispatch();
  
  let colorLabel = props.palette[props.index % props.palette.length];  
  const isSelected = props.selectedClusters.includes(props.label);
  
  return (
    <Button
      key={"button_" + props.label}
      disableRipple
      sx={{
        all: "initial",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
        },
        "&:focus": {
          backgroundColor: theme.palette.action.selected,
        },
      }}
      size="small"
      fullWidth
      tabIndex={500 + props.index}
      onClick={() => {
        const newSelectedClusters = isSelected
          ? props.selectedClusters.filter((e) => e !== props.label)
          : [...props.selectedClusters, props.label];

        dispatch(setSelectedClusters(newSelectedClusters));

        const canvas = document.getElementById(
          `canvas_${props.canvasID}_${props.label}`
        );

        if (canvas === null) {
          return;
        }

        canvas!.style.opacity = isSelected ? "0%" : "100%";
      }}
      onFocus={() =>
        labelOnMouseEnter(
          props.label,
          props.allClusters,
          props.selectedClusters,
          props.canvasID
        )
      }
      onBlur={() =>
        labelOnMouseLeave(
          props.label,
          props.allClusters,
          props.selectedClusters,
          props.canvasID
        )
      }
      onMouseEnter={() =>
        labelOnMouseEnter(
          props.label,
          props.allClusters,
          props.selectedClusters,
          props.canvasID
        )
      }
      onMouseLeave={() =>
        labelOnMouseLeave(
          props.label,
          props.allClusters,
          props.selectedClusters,
          props.canvasID
        )
      }
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
              key={"label_stack_" + props.label}
              direction="row"
              alignItems="center"
              justifyContent="left"
            >
              <Square
                key={"label_square_" + props.label}
                sx={{
                  width: 22,
                  height: 22,
                  marginRight: 1,
                  color: colorLabel,
                }}
              />
              <Typography
                key={"label_typography_" + props.label}
                color={colorLabel}
                fontSize={theme.typography.fontSize}
              >
                {props.label}
              </Typography>
            </Stack>
          </Stack>
        </Grid>
        <Grid item>
          <Checkbox
            checked={props.selectedClusters.includes(props.label)}
            tabIndex={-1}
            size="small"
            sx={{
              p: 0,
            }}
          />
        </Grid>
      </Grid>
    </Button>
  );
  
}

function labelOnMouseEnter(label: string, allClusters: string[], selected: string[], canvasID: string) {
  const canvas = document.getElementById(`canvas_${canvasID}_${label}`);

  if (canvas === null) {
    return;
  }
  
  canvas!.style.zIndex = "8";
  canvas!.style.opacity = "100%";
    
  allClusters.forEach((tempLabel) => {
    if (label !== tempLabel) {
      const otherCanvas = document.getElementById(`canvas_${canvasID}_${tempLabel}`);
      otherCanvas!.style.filter = "grayscale(1)";
    }
  });
}

function labelOnMouseLeave(label: string, allClusters: string[], selected: string[], canvasID: string) {
  const canvas = document.getElementById(`canvas_${canvasID}_${label}`);

  if (canvas === null) {
    return;
  }
  
  canvas!.style.zIndex = "5";
  
  if (!selected.includes(label)) {
    canvas!.style.opacity = "0%";
  }

  allClusters.forEach((tempLabel) => {
    if (label !== tempLabel) {
      const otherCanvas = document.getElementById(`canvas_${canvasID}_${tempLabel}`);
      otherCanvas!.style.filter = "grayscale(0)";
    }
  });
}
