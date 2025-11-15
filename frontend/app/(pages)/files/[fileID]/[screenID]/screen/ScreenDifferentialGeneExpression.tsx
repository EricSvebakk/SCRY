import { Grid } from "@mui/material";
import { DotPlot } from "@/lib/components/plots/DotPlot";
import ListRanking from "@/lib/components/controls/ListRanking";
import ListRankings from "@/lib/components/controls/ListRankings";
export default function ScreenDifferentialGeneExpression() {
  
  return (
    <Grid
      container
      direction="row"
      columnGap={"1vh"}
      sx={{
        height: "100%",
      }}
    >
      <Grid
        item
        container
        direction="column"
        width={250}
        rowGap={"1vh"}
        // sx={{
        //   height: "100%"
        // }}
      >
        <Grid
          item
          xs
          width="100%"
          sx={{
            border: "1px solid grey",
            height: "50vh",
          }}
        >
          <ListRankings />
        </Grid>

        <Grid
          item
          xs
          width="100%"
          sx={{
            border: "1px solid grey",
            height: "40vh"
          }}
        >
          <ListRanking />
        </Grid>
      </Grid>

      <Grid
        item
        xs
        // sx={{
        //   height: "100%",
        // }}
      >
        <DotPlot />
      </Grid>
    </Grid>
  );
  
}