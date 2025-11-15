
import { createTheme, SxProps } from "@mui/material";
import * as d3 from "d3";

export const theme = createTheme({
  palette: {
    // primary: {
    //   main: ""
    // },
    // action: {
    //   // disabledBackground:"rgb(147, 187, 227)",
    // },
    // back
    text: {
      // primary: "#000",
      primary: "#424242",
      secondary: "#424242",
    },
    primary: {
      main: "#aaaaff",
    },
    secondary: {
      main: "#d9d9feff",
    },
    // text: {
    //   secondary: "#ffffff"
    // },
    // secondary: {
    // }
    background: {
      // paper: "#afa",
      paper: "#ffffff",
      default: "#aaaaff",
    },
  },
  typography: {
    fontSize: 12,
    subtitle1: {
      fontSize: 9,
    },
  },
  // spacing: 8
});

export type linearScaleColorType = (t: number) => string;
export type sequentialScaleColorType = string[];

export const linearScaleColorOptions: { [key: string]: linearScaleColorType } = {
  orange: d3.interpolateOranges,
  viridis: d3.interpolateViridis,
  magma: d3.interpolateMagma,
};

export const sequentialScaleColorOptions: { [key: string]: sequentialScaleColorType } = {
  obs9: [
    "#4269d0", 
    "#efb118", 
    "#ff725c", 
    "#6cc5b0", 
    "#3ca951", 
    "#ff8ab7", 
    "#a463f2", 
    "#97bbf5", 
    "#9c6b4e", 
  ],
  cat10: d3.schemeCategory10 as [],
  pastel: d3.schemePastel1 as [],
  paired: d3.schemePaired as [],
};

export const ListTextProps: SxProps = {
  color: theme.palette.text.secondary,
  fontSize: theme.typography.fontSize,
  justifyContent: "start",
  textAlign: "start",
  overflowX: "clip",
  textTransform: "initial",
  width: "100%",
  textOverflow: "ellipsis"
}