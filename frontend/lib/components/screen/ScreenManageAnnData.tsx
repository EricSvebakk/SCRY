import { useAppSelector } from "@/lib/redux/hooks/hooks";
import { Grid } from "@mui/material";
import CurrentProgress from "../OverlayCurrentProgress";
import { DotPlot } from "../DotPlot";
import ListRanking from "../controls/ListRanking";
import ListTableData from "../controls/ListTableData";

export default function ScreenManageAnnData() {
  
  const statusHierarchy = useAppSelector((state) => state.plotReducer.status.get_file_hierarchy);  
  
  if (statusHierarchy.inProgress) {
    return <CurrentProgress status={statusHierarchy} />;
  }
  
  return (
    <Grid
      container
      direction="row"
      columnGap={1}
      sx={{
        height: "100%",
        width: "100%",
      }}
    >
      <Grid
        item
        container
        direction="column"
        width={250}
        rowGap={1}
        sx={{
          height: "100%",
        }}
      >
        <Grid
          item
          xs
          width="100%"
          sx={{
            border: "1px solid grey",
          }}
        >
          {/* <ListRanking /> */}
        </Grid>

        <Grid
          item
          xs
          width="100%"
          sx={{
            border: "1px solid grey",
          }}
        >
          {/* <ListTableData /> */}
        </Grid>
      </Grid>

      <Grid
        item
        xs
        sx={{
          height: "100%",
          border: "1px solid grey",
        }}
      >
        {/* <DotPlot /> */}
      </Grid>
    </Grid>
  );
  
}