import { Grid } from "@mui/material";
import { ClusterScatterPlot } from "@/lib/components/plots/ClusterScatterPlot";
import { useAppSelector } from "@/lib/redux/hooks/hooks";
import { ListCluster } from "@/lib/components/controls/ListCluster";
import ListEmbeddings from "@/lib/components/controls/ListEmbeddings";
import ListClusterings from "@/lib/components/controls/ListObservations";

export default function ScreenDimensionalReduction() {
  
  return (
    <Grid
      container
      direction="row"
      columnGap={"1vh"}
      sx={{
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Grid
        item
        container
        direction="column"
        rowGap={"1vh"}
        height="100%"
        width={250}
      >

        <Grid
          item
          width="100%"
          sx={{
            border: "1px solid grey",
            height: "29vh"
          }}
        >
          <ListEmbeddings />
        </Grid>

        <Grid
          item
          width="100%"
          sx={{
            border: "1px solid grey",
            height: "68vh"
          }}
        >
          <ListClusterings />
        </Grid>
      </Grid>

      <Grid
        item
        container
        xs
        height="100%"
        direction="row"
        sx={{
          border: "1px solid grey"
        }}
      >
        <Grid item xs>
          <ClusterScatterPlot canvasID="plot_dim_reduction" />
        </Grid>

        <Grid item width={250}>
          <ListCluster canvasID="plot_dim_reduction" />
        </Grid>
      </Grid>
    </Grid>
  );
}
