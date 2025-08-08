import { useAppSelector } from "@/lib/redux/hooks/hooks";
import { Grid, Stack } from "@mui/material";
import CurrentProgress from "../OverlayCurrentProgress";
import { DotPlot } from "../DotPlot";
import DotplotDialog from "../modals/DotplotDialog";
import { useState } from "react";
import { theme } from "@/app/layout";
import ButtonSecondary from "../custom/ButtonSecondary";
import ListTableData from "../controls/ListTableData";

export default function ScreenDifferentialGeneExpression() {
  
  const statusHierarchy = useAppSelector((state) => state.plotReducer.status.get_file_hierarchy);
  
  const [isDotplotDialogOpen, setIsDotplotDialogOpen] = useState(false);
  
  
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
      }}
    >
      <Grid
        item
        width={250}
        sx={{
          height: "100%",
          border: "1px solid grey",
        }}
      > 
        <Stack
          direction="column"
          sx={{
            width: "100%",
            height: "100%",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <ButtonSecondary
            title="+ Generate DGE"
            onClick={() => setIsDotplotDialogOpen(true)}
            sx={{
              borderBottom: "1px solid grey",
            }}
          />

          <ListTableData />

          <DotplotDialog
            isOpen={isDotplotDialogOpen}
            setIsOpen={setIsDotplotDialogOpen}
          />
        </Stack>
      </Grid>

      <Grid
        item
        xs
        sx={{
          height: "100%",
        }}
      >
        <DotPlot />
      </Grid>
    </Grid>
  );
  
}