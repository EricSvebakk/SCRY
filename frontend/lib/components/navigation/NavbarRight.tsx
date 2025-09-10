
import { Box, Button, Grid, Stack, SxProps, Typography } from "@mui/material";
import React, { useState } from "react";
import { theme } from "@/app/layout";
import { BlurCircular, FileOpen, GroupWork, ScatterPlot } from "@mui/icons-material";
import PanelGenes from "./panel/PanelGenes";
import PanelFiles from "./panel/PanelFiles";
import PanelReclustering from "./panel/PanelReclustering";

export default function NavbarRight() {
  

  const [openPanelGenes, setOpenPanelGenes] = useState(false);
  const [openPanelRecluster, setOpenPanelRecluster] = useState(false);
  const [openPanelFiles, setOpenPanelFiles] = useState(false);
  
  const navItemProps = (isOpen: boolean, up: boolean = false, down: boolean = false) => {
    return {
      color: theme.palette.text.secondary,
      backgroundColor: isOpen
        ? theme.palette.primary.main
        : theme.palette.secondary.main,
      height: "100%",
      fontWeight: "bold",
      borderRadius: "0",
      "&:hover": {
        backgroundColor: "#aaa",
      },
      borderTop: isOpen && up ? "1px solid grey" : "none",
      borderBottom: isOpen && down ? "1px solid grey" : "none",
      borderLeft: isOpen  ? "none" : "1px solid grey",
    } as SxProps;
  };
  
  return (
    <Box height="100%">
      <PanelGenes open={openPanelGenes} setOpen={setOpenPanelGenes}/>
      <PanelReclustering open={openPanelRecluster} setOpen={setOpenPanelRecluster}/>
      {/* <PanelFiles open={openPanelFiles} setOpen={setOpenPanelFiles}/> */}

      <Grid
        item
        container
        direction="column"
        height="100%"
        overflow="clip"
        sx={{
          zIndex: 1200,
        }}
      >
        {/* <Grid item height={70}>
          <Button
            fullWidth
            sx={navItemProps(openPanelFiles)}
            onClick={() => {
              setOpenPanelFiles(!openPanelFiles);
            }}
          >
            <Stack
              direction="column"
              sx={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {<FileOpen />}
              <Typography fontSize={theme.typography.subtitle1.fontSize}>
                Select file
              </Typography>
            </Stack>
          </Button>
        </Grid> */}
        
        <Grid item height={70}>
          <Button
            fullWidth
            sx={navItemProps(openPanelGenes, false, true)}
            onClick={() => {
              setOpenPanelGenes(!openPanelGenes);
            }}
          >
            <Stack
              direction="column"
              sx={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {<GroupWork />}
              <Typography fontSize={theme.typography.subtitle1.fontSize}>
                View Gene
              </Typography>
            </Stack>
          </Button>
        </Grid>
        
        <Grid item height={70}>
          <Button
            fullWidth
            sx={navItemProps(openPanelRecluster, true, true)}
            onClick={() => {
              setOpenPanelRecluster(!openPanelRecluster);
            }}
          >
            <Stack
              direction="column"
              sx={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {<BlurCircular />}
              <Typography fontSize={theme.typography.subtitle1.fontSize}>
                Re-cluster observation
              </Typography>
            </Stack>
          </Button>
        </Grid>

        <Grid
          item
          xs
          sx={{
            height: "100%",
            width: "100%",
            borderLeft: "1px solid grey",
            backgroundColor: theme.palette.secondary.main,
          }}
        />
      </Grid>
    </Box>
  );
  
}