
import { Button, Grid, Stack, SvgIconProps, SxProps, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { theme } from "@/app/layout";
import { tabOptions } from "@/lib/types";
import { setCurrentTab, setSelectedAttribute } from "@/lib/redux/reducers/plotReducer";
import { Hub } from "@mui/icons-material";
import { get_feature_coordinates } from "@/lib/fetch/get_feature_coordinates";

type Screen = {
  label: string;
  id: tabOptions;
  component: JSX.Element;
  icon: ReactElement<SvgIconProps>;
};

export default function NavbarLeft(props: {
  screens: Screen[];
  selectedScreen: number;
  setSelectedScreen: Function;
}) {
  
  const fileID = useAppSelector((state) => state.fileReducer.activeFile);
  const attr = useAppSelector((state) => state.plotReducer.filtering.selected.attribute);
  
  const dispatch = useAppDispatch();  
  
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
                dispatch(setCurrentTab(e.id));
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

      <Grid item height={70}>
        <Button
          fullWidth
          sx={navItemProps(false)}
          onClick={() => {
            get_feature_coordinates(fileID as string, "IFI27", dispatch);
          }}
        >
          <Stack
            direction="column"
            sx={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {<Hub />}
            <Typography fontSize={theme.typography.subtitle1.fontSize}>
              click me
            </Typography>
          </Stack>
        </Button>
      </Grid>

      <Grid item height={70}>
        <Button
          fullWidth
          sx={navItemProps(false)}
          onClick={() => {
            dispatch(setSelectedAttribute(attr === "obs" ? "var" : "obs"));
          }}
        >
          <Stack
            direction="column"
            sx={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {<Hub />}
            <Typography fontSize={theme.typography.subtitle1.fontSize}>
              toggle attr
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
          borderRight: "1px solid grey",
          backgroundColor: theme.palette.secondary.main,
        }}
      />
    </Grid>
  );
  
}