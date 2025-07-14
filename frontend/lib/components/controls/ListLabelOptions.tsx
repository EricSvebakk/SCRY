
import { Button, Stack } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { my_colors } from "../ScatterPlotGenerator";
import { AnndataIndices } from "../../types";
import { LabelListItem } from "../LabelListItem";
import CurrentProgress from "../OverlayCurrentProgress";

export function ListLabelOptions() {
  
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs);
  const status = useAppSelector((state) => state.plotReducer.status.get_file_obs)
  
  const dispatch = useAppDispatch();
  
  if (status.inProgress) {
    return (
      <CurrentProgress
        status={status}
      />
    )
  }
  
  return (
    <Stack
      direction="column"
      sx={{
        height: "30vh",
        width: "100%",
        overflowY: "auto",
      }}
    >
      {obs.indices?.categories.map((label, i) => {
        let label_color = my_colors[i % my_colors.length];

        return (
          <Button
            key={"button_" + label}
            disableRipple
            sx={{ all: "initial" }}
            size="small"
            onClick={() => {
              // const newLabels = selectedLabels.includes(label)
              //   ? selectedLabels.filter((e) => e !== label)
              //   : [...selectedLabels, label];

              // dispatch(setSelectedLabels(newLabels));
            }}
            onMouseEnter={() => labelOnMouseEnter(label, obs.indices!)}
            onMouseLeave={() => labelOnMouseLeave(label, obs.indices!)}
          >
            <LabelListItem
              key={"label_" + label}
              label={label}
              label_color={label_color}
            />
          </Button>
        );
      })}
    </Stack>
  );
  
}

function labelOnMouseEnter(label: string, obs: AnndataIndices) {
  
  const canvas = document.getElementById(
    "points_" + label
  );

  canvas!!.style.zIndex = "8";

  obs!!.categories.forEach(
    (label_temp, index_other) => {
      if (label !== label_temp) {
        const otherCanvas =
          document.getElementById(
            "points_" + label_temp
          );
        otherCanvas!.style.filter = "grayscale(1)";
        otherCanvas!.style.opacity = "0%";
      }
    }
  );
  
}

function labelOnMouseLeave(label: string, obs: AnndataIndices) {
  
  const canvas = document.getElementById(
    "points_" + label
  );

  canvas!!.style.zIndex = "5";

  obs!!.categories.forEach((label_temp, index_other) => {
    if (label !== label_temp) {
      const otherCanvas = document.getElementById("points_" + label_temp);
      otherCanvas!.style.filter = "grayscale(0)";
      otherCanvas!.style.opacity = "100%";
    }
  });
  
}