"use client";

import {
  Box,
  Button,
  Grid,
  IconButton,
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
import { ScatterPlot, ViewCompact } from "@mui/icons-material";

type step = {
  label: string;
  id: tabOptions;
  loading: boolean;
  isOpen: boolean;
  function: Function;
  screen: JSX.Element;
  icon: ReactElement<SvgIconProps>;
};

export default function FileIdPage({}) {
  
  const { fileID } = useParams();

  const status = useAppSelector((state) => state.plotReducer.status);

  const dispatch = useAppDispatch();

  const [isDRScreenOpen, setIsDRScreenOpen] = useState(true);
  const [isDEScreenOpen, setIsDEScreenOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number>(0);
  
  const steps: step[] = [
    {
      label: "Dimensional Reduction",
      id: "scatterplot",
      isOpen: isDRScreenOpen,
      function: (val: boolean) => setIsDRScreenOpen(val),
      loading: false,
      screen: <ScreenDimensionalReduction />,
      icon: <ScatterPlot />,
    },
    {
      label: "Differential Expression",
      id: "dotplot",
      isOpen: isDEScreenOpen,
      function: (val: boolean) => setIsDEScreenOpen(val),
      loading: status.get_rgg_dotplot.inProgress,
      screen: <ScreenDifferentialGeneExpression />,
      icon: <ViewCompact />,
    },
  ];

  useEffect(() => {
    
    // console.log(typeof fileID, status);

    if (typeof fileID === "string") {
      dispatch(setActiveFile(fileID));
      
      setSelectedStep(0);
      steps[0].function(true);
      
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
        {steps.map((e, i) => {
          return (
            <Grid
              item
              key={`steps_item_grid_${i}`}
              height={85}
            >
              <Button
                key={`steps_item_button_${i}`}
                fullWidth
                sx={{
                  color: theme.palette.text.secondary,
                  backgroundColor: e.isOpen
                    ? theme.palette.primary.main
                    : theme.palette.secondary.main,
                  height: "100%",
                  fontWeight: "bold",
                  borderRadius: "0",
                  "&:hover": {
                    backgroundColor: "#aaa",
                  },
                  borderTop: e.isOpen && i !== 0 ? "1px solid grey" : "none",
                  borderBottom: e.isOpen ? "1px solid grey" : "none",
                  borderRight: e.isOpen ? "none" : "1px solid grey",
                }}
                onClick={() => {
                  steps.forEach((e) => e.function(false));
                  e.function(true);
                  setSelectedStep(i);
                  dispatch(setCurrentTab(e.id));
                }}
              >
                <Stack
                  direction="column"
                  sx={{
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {e.icon}
                  <Typography fontSize={theme.typography.subtitle1.fontSize}>{e.label}</Typography>
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
        {steps[selectedStep].screen}
      </Grid>
    </Grid>
  );
}
