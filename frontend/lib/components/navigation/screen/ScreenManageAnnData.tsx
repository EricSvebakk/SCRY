
import { Grid } from "@mui/material";
import ListSelectedObservations from "../../controls/ListSelectedObservations";
import { useState } from "react";
import DialogFileSelctor from "../../modals/DialogFileSelector";
import ButtonSecondary from "../../custom/ButtonSecondary";
import DialogFileSaver from "../../modals/DialogFileSaver";
import CurrentProgress from "../../OverlayCurrentProgress";
import { useAppSelector } from "@/lib/redux/hooks/hooks";

export default function ScreenManageAnnData() {
  
  const status = useAppSelector((state) => state.plotReducer.status.save_file_as)
  
  const [isFileSelectorOpen, setIsFileSelectorOpen] = useState(false);
  const [isFileSaverOpen, setIsFileSaverOpen] = useState(false);
  
  return (
    <Grid
      container
      direction="row"
      columnGap={1}
      sx={{
        height: "100%",
        width: "100%",
        maxHeight: "100%",
        overflow: "hidden",
      }}
    >
      <Grid
        item
        width={200}
        sx={{
          border: "1px solid grey",
        }}
      >
        <ButtonSecondary
          title="Open File"
          onClick={() => setIsFileSelectorOpen(true)}
          sx={{
            borderBottom: "1px solid grey",
          }}
        />

        <ButtonSecondary
          title="Merge with file"
          onClick={() => setIsFileSelectorOpen(true)}
          disabled
          sx={{
            borderBottom: "1px solid grey",
          }}
        />

        <ButtonSecondary
          title="Save File as"
          onClick={() => setIsFileSaverOpen(true)}
          sx={{
            borderBottom: "1px solid grey",
          }}
        />

        <DialogFileSelctor
          isOpen={isFileSelectorOpen}
          setIsOpen={setIsFileSelectorOpen}
        />

        <DialogFileSaver
          isOpen={isFileSaverOpen}
          setIsOpen={setIsFileSaverOpen}
        />

        {/* TODO: ADD SOMETHING HERE */}
      </Grid>

      <Grid
        item
        container
        direction="column"
        width={400}
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
          <ListSelectedObservations />
        </Grid>
      </Grid>

      <Grid
        item
        xs
        sx={{
          height: "100%",
          border: "1px solid grey",
          backgroundColor: "white",
          p: 1,
        }}
      >
        
        { status.inProgress ? <CurrentProgress status={status} /> : <></> }
        
        {/* TODO: ADD SOMETHING HERE */}
      </Grid>
    </Grid>
  );
  
}