import { Grid } from "@mui/material";
import ListEmbeddings from "../controls/ListEmbeddings";
import ListClusterings from "../controls/ListClusterings";
import { ScatterPlot } from "@/lib/components/ScatterPlot";
import { ListCluster } from "../controls/ListCluster";

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
        container
        direction="column"
        rowGap={1}
        height="100%"
        width={250}
      >
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
          <ListClusterings />
        </Grid>
      </Grid>
      
      <Grid
        item container
        xs
        height="100%"
        direction="row"
      >        
        <Grid
          item
          xs
        >
          <ScatterPlot />
        </Grid>

        <Grid
          item
          width={250}
        >
          <ListCluster />
        </Grid>
      </Grid>
    </Grid>
  );
}
