
import { Grid } from "@mui/material";
import ListSelectedObservations from "../controls/ListSelectedObservations";
import { useState } from "react";
import DialogFileSelctor from "../modals/DialogFileSelector";
import ButtonSecondary from "../custom/ButtonSecondary";



export default function ScreenManageAnnData() {
  
  const [isFileSelectorOpen, setIsFileSelectorOpen] = useState(false);
  
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
          onClick={() => setIsFileSelectorOpen(true)}
          disabled
          sx={{
            borderBottom: "1px solid grey",
          }}
        />

        <DialogFileSelctor
          isOpen={isFileSelectorOpen}
          setIsOpen={setIsFileSelectorOpen}
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
        {/* TODO: ADD SOMETHING HERE */}
      </Grid>
    </Grid>
  );
  
}