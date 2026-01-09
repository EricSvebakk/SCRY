import { Box, Button, Grid, Stack, SxProps, Typography } from "@mui/material";
import React, { ReactElement, useState } from "react";
import { theme } from "@/lib/design";
import { BlurCircular, GroupWork } from "@mui/icons-material";
import PanelGenes from "./panel/PanelGenes";
import PanelReclustering from "./panel/PanelReclustering";
import { useAppSelector } from "@/lib/redux/hooks/hooks";
import PanelMerging from "./panel/PanelMerging";

export default function NavbarRight() {
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs);

  const [activePanel, setActivePanel] = useState<0 | 1 | 2 | null>(null);

  const navItemProps = (
    isOpen: boolean,
    up: boolean = false,
    down: boolean = false
  ) => {
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
      borderLeft: isOpen ? "none" : "1px solid grey",
    } as SxProps;
  };

  return (
    <Box height="100%">
      <PanelGenes open={activePanel === 0} setOpen={setActivePanel} />
      <PanelReclustering open={activePanel === 1} setOpen={setActivePanel} />
      <PanelMerging open={activePanel === 2} setOpen={setActivePanel} />

      <Grid
        item
        container
        direction="column"
        height="100%"
        minHeight="100vh"
        overflow="clip"
        sx={{
          zIndex: 1200,
        }}
      >
        <NavButton
          label="View Gene"
          icon={<GroupWork />}
          sx={navItemProps(activePanel === 0, false, true)}
          onClick={() => setActivePanel(activePanel === 0 ? null : 0)}
        />

        <NavButton
          label="Re-cluster observation"
          icon={<BlurCircular />}
          sx={navItemProps(activePanel === 1, true, true)}
          onClick={() => setActivePanel(activePanel === 1 ? null : 1)}
        />

        <NavButton
          label="Merge data"
          icon={<BlurCircular />}
          sx={navItemProps(activePanel === 2, true, true)}
          onClick={() => setActivePanel(activePanel === 2 ? null : 2)}
        />
        
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

function NavButton(props: {
  label: string;
  disabled?: boolean;
  sx: SxProps;
  icon: ReactElement;
  onClick: () => void;
}) {
  const { label, disabled, sx, icon, onClick } = props;

  return (
    <Grid item height={70}>
      <Button
        fullWidth
        disabled={disabled ? disabled : false}
        sx={sx}
        onClick={() => onClick()}
      >
        <Stack
          direction="column"
          sx={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
          <Typography fontSize={theme.typography.subtitle1.fontSize}>
            {label}
          </Typography>
        </Stack>
      </Button>
    </Grid>
  );
}
