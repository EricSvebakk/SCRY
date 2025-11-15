
import { Box, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import DotPlotGenerator from "./DotPlotGenerator";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import CurrentProgress from "../OverlayCurrentProgress";
import { theme } from "@/lib/design";
import { PopoverImageSaving } from "../modals/popover/PopoverImageSaving";
import { DotPlotConfigurationPopover } from "../modals/popover/PopoverDotPlotConfiguration";
import { PopoverImageSavingDotplot } from "../modals/popover/popoverImageSavingDotplot";

export default function MiniatureDotPlot() {
  
  const gde = useAppSelector((state) => state.plotReducer.data.GDE);
  const status = useAppSelector((state) => state.plotReducer.statusBackend.celeryFileRGG);
  const config = useAppSelector((state) => state.plotReducer.plot.expression)
  
  const dispatch = useAppDispatch();
  
  const [counter, setCounter] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    
    let cleanUpFunction;
    
    if (svgRef.current && gde.expression && gde.dendrogram) {
      // cleanUpFunction = DotPlotGenerator({
      //   current: svgRef.current,
      //   gde: gde,
      //   config: config,
      //   dispatch: dispatch
      // });
    }
    
    return cleanUpFunction;
    
  }, [
    counter,
    gde.expression,
    config.palette,
    config.highlight,
    config.expressionMin,
    config.expressionMax,
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
        height: "58vh",
        width: "100%",
        backgroundColor: theme.palette.background.paper,
        border: "1px solid grey",
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
        <DotPlotConfigurationPopover />
        <PopoverImageSavingDotplot />
      </Stack>

      {status.inProgress ? (
        <CurrentProgress status={status} />
      ) : (
        <Box
          position="relative"
          overflow="auto"
          height="100%"
          sx={{
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Box
            component="svg"
            ref={svgRef}
            width={gde.nGenes ? gde.nGenes * 15 : "100%"}
            height={gde.nClusters ? gde.nClusters * 15 + 150 : "100%"}
            sx={{
              position: "absolute",
              zIndex: 1,
            }}
            id="dotplot"
          />
          {!gde.expression ? (
            <Box
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                // border: "1px solid yellow",
                alignContent: "center",
                justifyItems: "center",
              }}
            >
              <Typography fontSize={theme.typography.fontSize}>
                No Observations selected
              </Typography>
            </Box>
          ) : (
            <></>
          )}
        </Box>
      )}
    </Stack>
  );
  
}