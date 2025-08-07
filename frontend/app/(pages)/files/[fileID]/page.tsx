"use client";

import {
  Button,
  Grid,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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

type step = {
  label: string;
  id: tabOptions;
  loading: boolean;
  isOpen: boolean;
  function: Function;
  screen: JSX.Element
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
      label: "Dimensional Reduction & Clustering",
      id: "scatterplot",
      isOpen: isDRScreenOpen,
      function: (val: boolean) => setIsDRScreenOpen(val),
      loading: false,
      screen: <ScreenDimensionalReduction />,
    },
    {
      label: "Differential Expression",
      id: "dotplot",
      isOpen: isDEScreenOpen,
      function: (val: boolean) => setIsDEScreenOpen(val),
      loading: status.get_rgg_dotplot.inProgress,
      screen: <ScreenDifferentialGeneExpression />,
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
      sx={{
        // border: "1px solid grey",
        backgroundColor: theme.palette.background.default
      }}
    >
      <Grid
        item
        width={120}
        height="100%"
        overflow="clip"
      >
        <Grid
          container
          direction="column"
          height="100%"
        >
          {steps.map((e, i) => {
            return (
              <Grid item xs key={`steps_item_grid_${i}`}>
                <Button
                  key={`steps_item_button_${i}`}
                  fullWidth
                  sx={{
                    color: theme.palette.text.secondary,
                    backgroundColor: e.isOpen ? "none" : theme.palette.secondary.main,
                    height: "100%",
                    fontWeight: "bold",
                    borderRadius: "0",
                    "&:hover": {
                      backgroundColor: "#aaa",
                    },
                    borderRight: e.isOpen ? "none" : "1px inset grey",
                    borderTop: (e.isOpen && (i !== 0)) ? "1px inset grey" : "none",
                    borderBottom: (e.isOpen && (i !== steps.length-1)) ? "1px inset grey" : "none",
                  }}
                  size="small"
                  onClick={() => {
                    steps.forEach((e) => e.function(false));
                    e.function(true);
                    setSelectedStep(i);
                    dispatch(setCurrentTab(e.id))
                  }}
                >
                  {e.label}
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </Grid>

      <Grid
        item
        xs
        height="100%"
        sx={{
          p: "1vh"
        }}
      >
        {steps[selectedStep].screen}
      </Grid>
    </Grid>
  );
}
