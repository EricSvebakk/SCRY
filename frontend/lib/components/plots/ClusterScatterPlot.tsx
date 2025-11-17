
import { Box, Stack, Typography } from "@mui/material";
import ClusterScatterPlotGenerator from "./ClusterScatterPlotGenerator";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import CurrentProgress from "../OverlayCurrentProgress";
import { theme } from "@/lib/design";
import { PopoverImageSaving } from "../modals/popover/PopoverImageSaving";
import { PopoverScatterplotSettings } from "../modals/popover/popoverScatterplotSettings";
import { PopoverSubset } from "../modals/popover/popoverSubset";

export function ClusterScatterPlot(props: {
  canvasID: string;
} = {
  canvasID: ""
}) {
  
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs);
  const obsm = useAppSelector((state) => state.plotReducer.anndata.obsm);
  const config = useAppSelector((state) => state.plotReducer.plot.cluster);
  const imageTrigger = useAppSelector((state) => state.plotReducer.navigation.triggers.saveScatterPlotImage);
  const status = useAppSelector((state) => state.plotReducer.status.Obsm);
    const statusOutgoing = useAppSelector((state) => state.plotReducer.status.Embedding);
  const selectedCluster = useAppSelector((state) => state.plotReducer.filtering.selected.clusters);
  
  const [counter, setCounter] = useState(0);
  const dispatch = useAppDispatch();
  const svgRef = useRef<SVGElement>(null);
  const clusterRefs = useRef<HTMLCanvasElement[]>([]);
  
  useEffect(() => {

    let cleanUpFunction1 = () => {};
    
    if (obsm.data && clusterRefs.current.length !== 0) {
      
      cleanUpFunction1 = ClusterScatterPlotGenerator({
        groupRefs: clusterRefs.current,
        config: config,
        indices: obs.indices,
        coordinates: obsm.data,
        selectedClusters: selectedCluster,
        dispatch: dispatch,
        imageTrigger: imageTrigger,
      });
    }
    
    return () => {
      cleanUpFunction1();
    };
    
  }, [
    obs,
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
        height: "98vh",
        width: "100%",
        backgroundColor: config.background
          ? config.background
          : theme.palette.background.paper,
      }}
    >
      <Stack
        direction="row"
        justifyItems="center"
        gap={1}
        sx={{
          backgroundColor: theme.palette.secondary.main,
          px: 0.5,
          height: 32,
          minHeight: 32,
          maxHeight: 32,
          borderBottom: "1px solid grey",
        }}
      >
        <PopoverScatterplotSettings />
        <PopoverImageSaving plot="cluster" trigger="saveScatterPlotImage" />
        <PopoverSubset />
      </Stack>

      <Stack width="100%" height="100%" direction="row" columnGap={1}>
        {status.inProgress ? (
          <CurrentProgress status={statusOutgoing} />
        ) : (
          <Stack direction="row" position="relative" height="100%" width="100%">
            {obsm.data ? (
              obs.indices ? (
                obs.indices.categories.map((e, i) => {
                  return (
                    <Box
                      component="canvas"
                      key={`canvas_${props.canvasID}_${e}`}
                      id={`canvas_${props.canvasID}_${e}`}
                      height="100%"
                      width="100%"
                      style={{
                        position: "absolute",
                        zIndex: 2,
                      }}
                      ref={(el: HTMLCanvasElement | null) => {
                        if (el) {
                          clusterRefs.current[i] = el!;
                        }
                      }}
                    />
                  );
                })
              ) : (
                <Box
                  component="canvas"
                  key={"points_single"}
                  id={"points_single"}
                  height="100%"
                  width="100%"
                  style={{
                    position: "absolute",
                  }}
                  ref={(el: HTMLCanvasElement | null) => {
                    if (el) {
                      clusterRefs.current[0] = el!;
                    }
                  }}
                />
              )
            ) : (
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
            )}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}