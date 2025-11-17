

import { Box, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import CurrentProgress from "../OverlayCurrentProgress";
import { theme } from "@/lib/design";
import { PopoverImageSaving } from "../modals/popover/PopoverImageSaving";
import FeatureScatterPlotGenerator from "./FeatureScatterPlotGenerator";

export function FeatureScatterPlot() {
  
  const vars = useAppSelector((state) => state.plotReducer.anndata.var);
  
  const obsm = useAppSelector((state) => state.plotReducer.anndata.obsm);
  const imageTrigger = useAppSelector((state) => state.plotReducer.navigation.triggers.saveFeaturePlotImage);
  const status = useAppSelector((state) => state.plotReducer.status.Obsm);
  const selectedCluster = useAppSelector((state) => state.plotReducer.filtering.selected.clusters);
  const config = useAppSelector((state) => state.plotReducer.plot.feature);
  
  const [counter, setCounter] = useState(0);
  const dispatch = useAppDispatch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {

    let cleanUpFunction;
    
    if (obsm.data && canvasRef.current) {
      
      cleanUpFunction = FeatureScatterPlotGenerator({
        canvasRef: canvasRef.current,
        config: config,
        indices: vars.indices,
        coordinates: obsm.data,
        selectedClusters: selectedCluster,
        dispatch: dispatch,
        imageTrigger: imageTrigger,
      });
    }
    
    return cleanUpFunction;
    
  }, [
    vars,
    obsm,
    config,
    imageTrigger,
    counter,
  ]);
  
  const updateCounter = () => {
    setCounter((counter) => counter += 1);
  }
  
  useEffect(() => {
    window.addEventListener("resize", updateCounter);
    return () => window.removeEventListener("resize", updateCounter);
  }, [updateCounter]);
  
  return (
    <Stack
      direction="column"
      sx={{
        height: "30vh",
        width: "100%",
        backgroundColor: theme.palette.background.paper,
        border: "1px solid grey",
      }}
    >
      <Stack
        direction="row"
        justifyItems="center"
        gap={1}
        sx={{
          px: 0.5,
          height: 32,
          backgroundColor: theme.palette.secondary.main,
          borderBottom: "1px solid grey",
        }}
      >
        <PopoverImageSaving plot="feature" trigger="saveFeaturePlotImage" />
      </Stack>

      {status.inProgress ? (
        <CurrentProgress status={status} />
      ) : (
        <Stack direction="row" position="relative" height="100%" width="100%">
          {obsm.data ? (
            <Box
              component="canvas"
              id="points_gene"
              height="100%"
              width="100%"
              style={{
                position: "absolute",
              }}
              ref={canvasRef}
            />
          ) : (
            <></>
          )}

          {!obsm.data ? (
            <Box
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                alignContent: "center",
                justifyItems: "center",
              }}
            >
              <Typography fontSize={theme.typography.fontSize}>
                No embedding selected
              </Typography>
            </Box>
          ) : (
            <></>
          )}
        </Stack>
      )}
    </Stack>
  );
}