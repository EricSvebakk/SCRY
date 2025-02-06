

import { Box, Container } from "@mui/material";
import LargeDatasetCanvasPlot from "./scatterplot";
import { useEffect, useRef } from "react";
import { Height } from "@mui/icons-material";

export function Plot(props: {
  plotData: {
    coordinates: number[][];
    labels: string[];
    label_map: number[];
  } | null;
}) {
  
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRefs = useRef<HTMLCanvasElement[]>([]);


  useEffect(() => {

    let cleanUpFunction;
    
    if (props.plotData && svgRef.current && groupRefs.current.length !== 0) {
      
      cleanUpFunction = LargeDatasetCanvasPlot({
        svgCurrent: svgRef.current,
        groupRefs: groupRefs.current,
        plotData: props.plotData
      });
      
    }
    
    return cleanUpFunction
    
  }, [props.plotData]);

  
  
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 800
        // width: 800,
        // height: 800,
      }}
    >
      {props.plotData?.labels.map((e, i) => {
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
            ref={(el) => {
              // console.log(el);
              groupRefs.current[i] = el!;
              return el;
            }}
          />
        );
      })}
      <Box
        component="svg"
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          zIndex: 10
        }}
        id="svgHere"
        ref={svgRef}
      />
    </Box>
  );
}