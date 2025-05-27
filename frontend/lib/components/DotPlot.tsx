
import { useEffect, useRef, useState } from "react";
import DotPlotGenerator from "./DotPlotGenerator";
import { useAppSelector } from "../redux/hooks/hooks";
import { RootState } from "../redux/stores/store";
import { Box, CircularProgress, Stack } from "@mui/material";


export function DotPlot() {
  
  const svgRef = useRef<SVGSVGElement>(null);
  
  const geneExpressionData = useAppSelector((state: RootState) => state.plotReducer.geneExpression);
  const geneDendrogramData = useAppSelector((state: RootState) => state.plotReducer.geneDendrogram);
  const inProgress = useAppSelector((state: RootState) => state.plotReducer.inProgress.get_rgg_dotplot);
  const [counter, setCounter] = useState(0);
  
  useEffect(() => {
    
    let cleanUpFunction;
    
    if (svgRef.current && geneExpressionData.length > 0 && geneDendrogramData) {
      cleanUpFunction = DotPlotGenerator({
        current: svgRef.current,
        plotData: geneExpressionData,
        dendrogramData: geneDendrogramData,
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
  
  if (inProgress) {
    return (
      <Stack
        sx={{
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CircularProgress size={100} color="primary"/>
      </Stack>
    );
  }
  
  return (
    <Box
      position="relative"
      width="100%"
      height="100%"
    >
      <Box
        component="svg"
        ref={svgRef}
        width="100%"
        height="100%"
        sx={{
          position: "absolute",
          zIndex: 1,
        }}
        id="bigtest"
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