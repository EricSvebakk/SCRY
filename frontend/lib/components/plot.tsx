

import { Box } from "@mui/material";
import LargeDatasetCanvasPlot from "./scatterplot";
import { useEffect, useRef } from "react";
import { obsData, obsmData } from "../types";

export function Plot(props: {
  title: string,
  obsData: obsData | null,
  obsmData: obsmData | null,
}) {
  
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRefs = useRef<HTMLCanvasElement[]>([]);


  useEffect(() => {
    
    console.log(props.obsData, props.obsmData)

    let cleanUpFunction;
    
    if (props.obsmData && svgRef.current && groupRefs.current.length !== 0) {
      
      cleanUpFunction = LargeDatasetCanvasPlot({
        title: props.title,
        svgCurrent: svgRef.current,
        groupRefs: groupRefs.current,
        obsData: props.obsData,
        obsmData: props.obsmData,
      });
      
    }
    
    return cleanUpFunction
    
  }, [props.obsData, props.obsmData]);

  
  
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        border: "1px solid grey"
      }}
    >
      {props.obsmData !== null ? (
        props.obsData !== null ? (
          props.obsData.labels.map((e, i) => {
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
    </Box>
  );
}