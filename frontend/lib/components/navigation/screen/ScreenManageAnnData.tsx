
import { Grid } from "@mui/material";
import React from "react";
import SelectClusterForFile from "../../SelectClusterForFile";
import SelectActiveFile from "../../SelectActiveFile";

export default function ScreenManageAnnData() {
  
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
      >
        <SelectActiveFile />
      </Grid>

      <Grid
        item
        xs
      >
        <SelectClusterForFile />
      </Grid>
    </Grid>
  );
  
}