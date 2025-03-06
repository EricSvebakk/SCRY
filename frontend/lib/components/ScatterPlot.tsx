

import { Box, Stack } from "@mui/material";
import ScatterPlotGenerator from "./ScatterPlotGenerator";
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks/hooks";
import { RootState } from "../redux/stores/store";

export function ScatterPlot() {
  
  const obs = useAppSelector((state: RootState) => state.plotReducer.obs);
  const obsm = useAppSelector((state: RootState) => state.plotReducer.obsm);
  
  const embedding = useAppSelector((state: RootState) => state.plotReducer.selectedEmbedding);
  const category = useAppSelector((state: RootState) => state.plotReducer.selectedCategory);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRefs = useRef<HTMLCanvasElement[]>([]);
  
  const dispatch = useAppDispatch();

  useEffect(() => {
    
    console.log("obs", obs);
    console.log("obsm", obsm);

    let cleanUpFunction;
    
    if (obsm && svgRef.current && groupRefs.current.length !== 0) {
      
      cleanUpFunction = ScatterPlotGenerator({
        title: `${embedding} > ${category}`,
        svgCurrent: svgRef.current,
        groupRefs: groupRefs.current,
        obsData: obs,
        obsmData: obsm,
        dispatch: dispatch,
      });
      
    }
    
    return cleanUpFunction
    
  }, [obs, obsm]);

  
  
  return (
    <Stack
      direction="row"
      columnGap={1}
      position="relative"
      height="100%"
      width="100%"
    >
      {obsm !== null ? (
        obs !== null ? (
          obs.labels.map((e, i) => {
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