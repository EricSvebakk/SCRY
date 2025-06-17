
import {
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  setSelectedLabels,
} from "../../redux/reducers/plotReducer";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { RootState } from "../../redux/stores/store";
import { my_colors } from "../ScatterPlotGenerator";
import { obsData } from "../../types";
import { LabelListItem } from "../LabelListItem";

export function ListLabelOptions() {
  
  const obs = useAppSelector((state: RootState) => state.plotReducer.obs);
  const selectedLabels = useAppSelector((state) => state.plotReducer.selectedLabels);
  const inProgress = useAppSelector((state) => state.plotReducer.inProgress.get_file_obs)
  
  const dispatch = useAppDispatch();
  
  if (inProgress) {
    return (
      <Stack
        sx={{
          height: "30vh",
          width: "100%",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CircularProgress size={100} color="primary"/>
      </Stack>
    );
  }
  
  return (
    <Stack
      direction="column"
      sx={{
        height: "30vh",
        width: "100%",
        overflowY: "auto"
      }}
    >          
      {
        obs?.labels.map((label, i) => {
          
          let label_color = my_colors[i % my_colors.length];
    
          return (
            <Button
              key={"button_" + label}
              disableRipple
              sx={{ all: "initial" }}
              size="small"
              onClick={() => {
  
                const newLabels = selectedLabels.includes(label)
                  ? selectedLabels.filter((e) => e !== label)
                  : [ ...selectedLabels, label ]
                  
                dispatch(setSelectedLabels(newLabels));
              }}
              onMouseEnter={() => labelOnMouseEnter(label, obs)}
              onMouseLeave={() => labelOnMouseLeave(label, obs)}
            >
              <LabelListItem
                key={"label_" + label}
                label={label}
                label_color={label_color}
              />
            </Button>
          );
        })
      }
    </Stack>
  )
  
}

function labelOnMouseEnter(label: string, obs: obsData) {
  
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
        otherCanvas!.style.filter = "grayscale(1)";
        otherCanvas!.style.opacity = "0%";
      }
    }
  );
  
}

function labelOnMouseLeave(label: string, obs: obsData) {
  
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
  
}