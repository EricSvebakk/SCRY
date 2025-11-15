
import { Box, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import DotPlotGenerator from "./DotPlotGenerator";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import CurrentProgress from "../OverlayCurrentProgress";
import { theme } from "@/lib/design";
import { DotPlotConfigurationPopover } from "../modals/popover/PopoverDotPlotConfiguration";
import { PopoverImageSavingDotplot } from "../modals/popover/popoverImageSavingDotplot";

export function DotPlot() {

  const gde = useAppSelector((state) => state.plotReducer.data.GDE);
  const config = useAppSelector((state) => state.plotReducer.plot.expression);
  const status = useAppSelector((state) => state.plotReducer.statusBackend.celeryFileRGG);
  const dispatch = useAppDispatch();
  
  const [counter, setCounter] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    let cleanUpFunction;

    if (svgRef.current && gde.expression && gde.dendrogram) {
      cleanUpFunction = DotPlotGenerator({
        current: svgRef.current,
        gde: gde,
        config: config,
        dispatch: dispatch,
      });
    }

    return cleanUpFunction;
  }, [
    counter,
    gde.expression,
    config.sortClustersBy,
    config.sortGenesBy,
    config.sortClustersByDirection,
    config.layer,
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
        height: "98vh",
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
            width={gde.nGenes ? 200 + (config.selected.length > 0 ? config.selected.length : gde.nGenes) * 15 : "100%"}
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