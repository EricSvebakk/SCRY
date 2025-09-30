import { Grid } from "@mui/material";
import ListEmbeddings from "../../controls/ListEmbeddings";
import ListClusterings from "../../controls/ListObservations";
import { ClusterScatterPlot } from "@/lib/components/plots/ClusterScatterPlot";
import { ListCluster } from "../../controls/ListCluster";
import ListConnectivities from "../../controls/ListConnectivities";
import { useAppSelector } from "@/lib/redux/hooks/hooks";

export default function ScreenDimensionalReduction() {

  const selectedCluster = useAppSelector((state) => state.plotReducer.filtering.selected.clusters);  
  
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
        {/* <Grid
          item
          xs
          width="100%"
          sx={{
            border: "1px solid grey",
          }}
        >
          <ListConnectivities />
        </Grid> */}
        
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
          <ClusterScatterPlot
            canvasID="reduction"
            selectedClusters={selectedCluster}
          />
        </Grid>

        <Grid
          item
          width={250}
        >
          <ListCluster
            canvasID="reduction"
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
