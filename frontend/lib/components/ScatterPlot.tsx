
import { Box, Stack, Typography } from "@mui/material";
import ScatterPlotGenerator from "./ScatterPlotGenerator";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks/hooks";
import CurrentProgress from "./OverlayCurrentProgress";
import { theme } from "@/app/layout";
import { ImageSavingPopover } from "./modals/ImageSavingPopover";

export function ScatterPlot() {
  
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs);
  const obsm = useAppSelector((state) => state.plotReducer.anndata.obsm);
  const imageTrigger = useAppSelector((state) => state.plotReducer.navigation.triggers.saveScatterPlotImage);
  const status = useAppSelector((state) => state.plotReducer.status.get_embedding);
  const selectedCluster = useAppSelector((state) => state.plotReducer.filtering.selected.clusters);
  
  const [counter, setCounter] = useState(0);
  const dispatch = useAppDispatch();
  const svgRef = useRef<HTMLCanvasElement>(null);
  const groupRefs = useRef<HTMLCanvasElement[]>([]);
  
  useEffect(() => {

    let cleanUpFunction;
    
    if (obsm.data && svgRef.current && groupRefs.current.length !== 0) {
      
      cleanUpFunction = ScatterPlotGenerator({
        svgCurrent: svgRef.current,
        groupRefs: groupRefs.current,
        indices: obs.indices,
        coordinates: obsm.data,
        selectedClusters: selectedCluster,
        dispatch: dispatch,
        imageTrigger: imageTrigger,
      });
    }
    
    return cleanUpFunction;
    
  }, [
    obs,
    obsm,
    imageTrigger,
    counter
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
        backgroundColor: theme.palette.background.paper,
        border: "1px solid grey",
        borderRight: "none",
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
        <ImageSavingPopover />
      </Stack>

      {status.inProgress ? (
        <CurrentProgress status={status} />
      ) : (
        <Stack direction="row" position="relative" height="100%" width="100%">
          {obsm.data ? (
            obs.indices ? (
              obs.indices.categories.map((e, i) => {
                return (
                  <Box
                    component="canvas"
                    key={"points_" + e}
                    id={"points_" + e}
                    height="100%"
                    width="100%"
                    style={{
                      position: "absolute",
                    }}
                    ref={(el: HTMLCanvasElement | null) => {
                      if (el) {
                        groupRefs.current[i] = el!;
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
                    groupRefs.current[0] = el!;
                  }
                }}
              />
            )
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

          <Box
            component="svg"
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              zIndex: 10,
            }}
            id="svgHere"
            ref={svgRef}
          />
        </Stack>
      )}
    </Stack>
  );
}