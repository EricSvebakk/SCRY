
import { useEffect, useRef } from "react";
import DotPlotGenerator from "./DotPlotGenerator";
import { useAppSelector } from "../redux/hooks/hooks";
import { RootState } from "../redux/stores/store";
import { Box } from "@mui/material";


export function DotPlot() {
  
  const svgRef = useRef<SVGSVGElement>(null);
  
  const obsExpressionData = useAppSelector((state: RootState) => state.plotReducer.obsExpression);
  
  useEffect(() => {
    
    let cleanUpFunction;
    
    if (svgRef.current && obsExpressionData.length > 0) {
      cleanUpFunction = DotPlotGenerator({
        current: svgRef.current,
        plotData: obsExpressionData
      });
    }
    
    return cleanUpFunction;
    
  }, [obsExpressionData])
  
  return (
    <Box
      position="relative"
      width="100%"
      height="100%"
    >
      <Box
        component="svg"
        width="100%"
        height="100%"
        sx={{
          position: "absolute",
          border: "1px solid orange",
          zIndex: 1,
        }}
        id="bigtest"
        ref={svgRef}
      />
      <Box
        component="div"
        width="100%"
        height="100%"
        id="tooltip_box"
        sx={{
          position: "absolute",
          zIndex: 0
        }}
      />
    </Box>
  );
  
}