

import { Box, Stack } from "@mui/material";
import ScatterPlotGenerator from "./ScatterPlotGenerator";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks/hooks";
import CurrentProgress from "./OverlayCurrentProgress";

export function ScatterPlot() {
  
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs);
  const obsm = useAppSelector((state) => state.plotReducer.anndata.obsm);
  const imageTrigger = useAppSelector((state) => state.plotReducer.navigation.triggers.saveScatterPlotImage);
  const status = useAppSelector((state) => state.plotReducer.status.get_embedding);
  
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

  if (status.inProgress) {
    return (
      <CurrentProgress
        status={status}
      />
    )
  }
  
  return (
    <Stack
      direction="row"
      columnGap={1}
      position="relative"
      height="100%"
      width="100%"
    >
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
                  position: "absolute"
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
              position: "absolute"
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
  );
}