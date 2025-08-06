import { Grid, Stack } from "@mui/material";
import ListEmbeddings from "../controls/ListEmbeddings";
import ListLabels from "../controls/ListClusterings";
import { ScatterPlot } from "@/lib/components/ScatterPlot";
import { ListLabelOptions } from "../controls/ListCluster";
import { theme } from "@/app/layout";
import { ImageSavingPopover } from "../modals/ImageSavingPopover";
import { DotPlotConfigurationPopover } from "../modals/DotPlotConfigurationPopover";

export default function ScreenDimensionalReduction() {

  return (
    <Grid
      container
      direction="row"
      columnGap={1}
      sx={{
        height: "100%",
      }}
    >
      <Grid
        item
        // xs
        width={250}
        sx={{
          height: "100%",
        }}
      >
        <Grid container direction="column" rowGap={1} height="100%">

          <Grid
            item
            xs
            width="100%"
            sx={{
              border: "1px solid grey",
            }}
          >
            <ListEmbeddings />
          </Grid>

          <Grid
            item
            xs
            width="100%"
            sx={{
              border: "1px solid grey",
            }}
          >
            <ListLabels />
          </Grid>
        </Grid>
      </Grid>

      <Grid
        item
        xs
        sx={{
          height: "100%",
          // border: "1px solid red",
        }}
      >
        <Grid
          container
          direction="row"
          columnGap={1}
          width="100%"
          height="100%"
        >
          <Grid
            item
            sx={{
              height: "100%",
              width: "100%",
              border: "1px solid grey",
            }}
            xs
          >
            <Stack direction="column" height="100%" width="100%">
              <Stack
                direction="row"
                sx={{
                  backgroundColor: theme.palette.secondary.main,
                  width: "100%",
                  borderBottom: "1px solid grey",
                }}
              >
                <DotPlotConfigurationPopover />
                <ImageSavingPopover />
              </Stack>

              <ScatterPlot />
            </Stack>
          </Grid>

          <Grid
            item
            sx={{
              width: 300,
              // border: "1px solid red",
            }}
          >
            <ListLabelOptions />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
