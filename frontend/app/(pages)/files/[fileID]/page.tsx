"use client";

import {
  Button,
  Grid,
  Stack,
  SvgIconProps,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import { ReactElement, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { setActiveFile } from "@/lib/redux/reducers/fileReducer";
import { get_file_hierarchy } from "@/lib/fetch/get_file_hierarchy";
import { get_genes } from "@/lib/fetch/get_genes";
import { get_model_types } from "@/lib/fetch/get_model_types";
import ScreenDimensionalReduction from "@/lib/components/screen/ScreenDimensionalReduction";
import ScreenDifferentialGeneExpression from "@/lib/components/screen/ScreenDifferentialGeneExpression";
import { theme } from "@/app/layout";
import { tabOptions } from "@/lib/types";
import { setCurrentTab } from "@/lib/redux/reducers/plotReducer";
import { ScatterPlot, Tune, ViewCompact } from "@mui/icons-material";
import ScreenManageAnnData from "@/lib/components/screen/ScreenManageAnnData";

type Screen = {
  label: string;
  id: tabOptions;
  component: JSX.Element;
  icon: ReactElement<SvgIconProps>;
};

export default function FileIdPage({}) {
  
  const { fileID } = useParams();

  const status = useAppSelector((state) => state.plotReducer.status);

  const dispatch = useAppDispatch();

  const [selectedScreen, setSelectedScreen] = useState<number>(0);
  
  const screens: Screen[] = [
    {
      label: "Dimensional Reduction",
      id: "scatterplot",
      component: <ScreenDimensionalReduction />,
      icon: <ScatterPlot />,
    },
    {
      label: "Differential Expression",
      id: "dotplot",
      component: <ScreenDifferentialGeneExpression />,
      icon: <ViewCompact />,
    },
    {
      label: "Manage AnnData",
      id: "table",
      component: <ScreenManageAnnData />,
      icon: <Tune />,
    },
  ];

  useEffect(() => {
    
    // console.log(typeof fileID, status);

    if (typeof fileID === "string") {
      dispatch(setActiveFile(fileID));
      
      setSelectedScreen(0);
      
      if (!status.get_file_hierarchy.inProgress) {
        get_file_hierarchy(fileID, dispatch);
      }
      if (!status.get_genes.inProgress) {
        get_genes(fileID, dispatch);
      }
      if (!status.get_model_types.inProgress) {
        get_model_types(fileID, dispatch);
      }
    }
  }, []);

  return (
    <Grid
      container
      direction="row"
      xs
    >
      <Grid
        item
        container
        direction="column"
        height="100%"
        width={85}
        overflow="clip"
      >
        {screens.map((e, i) => {
          const isOpen = selectedScreen === i;
          
          return (
            <Grid item key={`screen_item_grid_${i}`} height={85}>
              <Button
                key={`screen_item_button_${i}`}
                fullWidth
                sx={{
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
                  borderTop: isOpen && i !== 0 ? "1px solid grey" : "none",
                  borderBottom: isOpen ? "1px solid grey" : "none",
                  borderRight: isOpen ? "none" : "1px solid grey",
                }}
                onClick={() => {
                  setSelectedScreen(i);
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

      <Grid
        item
        xs
        height="100%"
        sx={{
          p: "1vh",
          backgroundColor: theme.palette.background.default,
        }}
      >
        {screens[selectedScreen].component}
      </Grid>
    </Grid>
  );
}
