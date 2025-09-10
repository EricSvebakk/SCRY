
import { Box, Button, Grid, Stack, SxProps, Typography } from "@mui/material";
import React, { useState } from "react";
import { theme } from "@/app/layout";
import { FileOpen, GroupWork } from "@mui/icons-material";
import PanelGenes from "./panel/PanelGenes";
import PanelFiles from "./panel/PanelFiles";

export default function NavbarRight() {
  

  const [openPanelGenes, setOpenPanelGenes] = useState(false);
  const [openPanelFiles, setOpenPanelFiles] = useState(false);
  
  const navItemProps = (isOpen: boolean, index: number | null = null) => {
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
      borderTop: isOpen && index && index !== 0 ? "1px solid grey" : "none",
      borderBottom: isOpen ? "1px solid grey" : "none",
      borderLeft: isOpen ? "none" : "1px solid grey",
    } as SxProps;
  };
  
  return (
    <Box height="100%">
      <PanelGenes open={openPanelGenes} setOpen={setOpenPanelGenes}/>
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
            sx={navItemProps(openPanelGenes)}
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
                Gene view
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