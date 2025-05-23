
import { useEffect, useRef, useState } from "react";
import DotPlotGenerator from "./DotPlotGenerator";
import { useAppSelector } from "../redux/hooks/hooks";
import { RootState } from "../redux/stores/store";
import { Box } from "@mui/material";


export function DotPlot() {
  
  const svgRef = useRef<SVGSVGElement>(null);
  
  const geneExpressionData = useAppSelector((state: RootState) => state.plotReducer.geneExpression);
  const [counter, setCounter] = useState(0);
  
  useEffect(() => {
    
    let cleanUpFunction;
    
    if (svgRef.current && geneExpressionData.length > 0) {
      cleanUpFunction = DotPlotGenerator({
        current: svgRef.current,
        plotData: geneExpressionData
      });
    }
    
    return cleanUpFunction;
    
  }, [geneExpressionData, counter]);
  
  const updateCounter = () => {
    setCounter((counter) => counter += 1);
  }
  
  useEffect(() => {
    window.addEventListener("resize", updateCounter);
    return () => window.removeEventListener("resize", updateCounter);
  }, [updateCounter]);
  
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