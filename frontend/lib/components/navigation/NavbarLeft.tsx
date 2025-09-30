
import { Button, Grid, Stack, SvgIconProps, SxProps, Typography } from "@mui/material";
import { ReactElement, useState } from "react";
import { theme } from "@/app/layout";
import { NotificationPopover } from "../modals/popover/NotificationPopover";
import PanelFiles from "./panel/PanelFiles";

type Screen = {
  label: string;
  id: string;
  component: JSX.Element;
  icon: ReactElement<SvgIconProps>;
};

export default function NavbarLeft(props: {
  screens: Screen[];
  selectedScreen: number;
  setSelectedScreen: Function;
}) {
  
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
      borderTop: isOpen ? "1px solid grey" : "none",
      borderBottom: isOpen ? "1px solid grey" : "none",
      borderRight: isOpen ? "none" : "1px solid grey",
    } as SxProps;
  };
  
  return (
    <Grid
      item
      container
      direction="column"
      height="100%"
      width="100%"
      overflow="clip"
    > 
      <Grid
        item
        height={70}
      >
        <PanelFiles sx={navItemProps(false, 0)}/>
      </Grid>
      
      {props.screens.map((e, i) => {
        const isOpen = props.selectedScreen === i;

        return (
          <Grid item key={`screen_item_grid_${i}`} height={70}>
            <Button
              key={`screen_item_button_${i}`}
              fullWidth
              sx={navItemProps(isOpen, i)}
              onClick={() => {
                props.setSelectedScreen(i);
              }}
            >
              <Stack
                key={`screen_item_stack_${i}`}
                direction="column"
                sx={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {e.icon}
                <Typography
                  key={`screen_item_text_${i}`}
                  fontSize={theme.typography.subtitle1.fontSize}
                >
                  {e.label}
                </Typography>
              </Stack>
            </Button>
          </Grid>
        );
      })}
      
      <Grid
        item
        xs
        sx={{
          height: "100%",
          width: "100%",
          borderRight: "1px solid grey",
          backgroundColor: theme.palette.secondary.main,
        }}
      />
      
      <Grid
        item
        height={70}
      >
        <NotificationPopover sx={navItemProps(false, 0)}/>
      </Grid>

      
      
    </Grid>
  );
  
}