
import { useEffect, useRef, useState } from "react";
import DotPlotGenerator from "./DotPlotGenerator";
import { useAppDispatch, useAppSelector } from "../redux/hooks/hooks";
import { RootState } from "../redux/stores/store";
import { Box, CircularProgress, Stack } from "@mui/material";


export function DotPlot() {
  
  const svgRef = useRef<SVGSVGElement>(null);
  
  const geneExpressionData = useAppSelector((state: RootState) => state.plotReducer.geneExpression);
  const geneDendrogramData = useAppSelector((state: RootState) => state.plotReducer.geneDendrogram);
  const nGenes = useAppSelector((state: RootState) => state.plotReducer.nGenes);
  const nClusters = useAppSelector((state: RootState) => state.plotReducer.nClusters);
  const inProgress = useAppSelector((state: RootState) => state.plotReducer.inProgress.get_rgg_dotplot);
  const dpOptions = useAppSelector((state: RootState) => state.plotReducer.dotplotOptions);
  const dispatch = useAppDispatch();
  
  const [counter, setCounter] = useState(0);
  
  useEffect(() => {
    console.log("legal dotplot", !!nGenes, !!geneDendrogramData, !!geneExpressionData)
    
    let cleanUpFunction;
    
    if (svgRef.current && geneExpressionData.length > 0 && geneDendrogramData && nGenes) {
      cleanUpFunction = DotPlotGenerator({
        current: svgRef.current,
        plotData: geneExpressionData,
        dendrogramData: geneDendrogramData,
        nGenes: nGenes,
        dpOptions: dpOptions,
        dispatch: dispatch
      });
    }
    
    return cleanUpFunction;
    
  }, [
      geneExpressionData,
      counter,
      dpOptions.coloring,
      dpOptions.highlight,
      dpOptions.expressionMin,
      dpOptions.expressionMax
    ]);
  
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
      overflow="auto"
      height="100%"
    >
      <Box
        component="svg"
        ref={svgRef}
        width={nGenes ? nGenes * 15 : "100%"}
        height={nClusters ? nClusters * 15 : "100%"}
        sx={{
          position: "absolute",
          zIndex: 1,
        }}
        id="dotplot"
      />
      <Box
        component="div"
        width="100%"
        height="100%"
        id="tooltip_box"
        sx={{
          position: "absolute",
          display: "none",
          zIndex: 0
        }}
      />
    </Box>
  );
  
}