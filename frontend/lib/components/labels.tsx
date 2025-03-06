import { Button, Stack, Tooltip, Typography } from "@mui/material";
import { my_colors } from "./ScatterPlotGenerator";
import { useAppSelector } from "../redux/hooks/hooks";
import { RootState } from "../redux/stores/store";
import { Square } from "@mui/icons-material";

export function Labels() {
  
  const obs = useAppSelector((state: RootState) => state.plotReducer.obs);
  const obsm = useAppSelector((state: RootState) => state.plotReducer.obsm);
  
  return (
    <Stack direction="column" border="1px solid red">
      {obs ? (
        obs.labels.map((label, i) => {
          let label_color = my_colors[i % my_colors.length];

          console.log(label_color, i, i % my_colors.length);

          return (
            <Tooltip
              key={"label_tooltip" + label}
              title={label}
              placement="bottom"
              enterDelay={2000}
              // leaveDelay={2000}
            >
              <Button
                disableRipple
                sx={{ all: "initial" }}
                size="small"
                onClick={() => {
                  const canvas = document.getElementById("points_" + label);

                  canvas!!.style.zIndex = "8";

                  obs!!.labels.forEach((label_temp, index_other) => {
                    if (label !== label_temp) {
                      const otherCanvas = document.getElementById(
                        "points_" + label_temp
                      );
                      otherCanvas!.style.opacity = "0%";
                    }
                  });
                }}
                onMouseEnter={() => {
                  const canvas = document.getElementById("points_" + label);

                  canvas!!.style.zIndex = "8";

                  obs!!.labels.forEach((label_temp, index_other) => {
                    if (label !== label_temp) {
                      const otherCanvas = document.getElementById(
                        "points_" + label_temp
                      );
                      otherCanvas!.style.filter = "grayscale(1)";
                    }
                  });
                }}
                onMouseLeave={() => {
                  const canvas = document.getElementById("points_" + label);

                  canvas!!.style.zIndex = "5";

                  obs!!.labels.forEach((label_temp, index_other) => {
                    if (label !== label_temp) {
                      const otherCanvas = document.getElementById(
                        "points_" + label_temp
                      );
                      otherCanvas!.style.filter = "grayscale(0)";
                      otherCanvas!.style.opacity = "100%";
                    }
                  });
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
                  </Typography>
                </Stack>
              </Button>
            </Tooltip>
          );
        })
      ) : (
        <></>
      )}
    </Stack>
  );
  
}