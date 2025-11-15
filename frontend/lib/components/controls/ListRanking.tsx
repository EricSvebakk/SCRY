
import { Box, Stack, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { useEffect, useRef } from "react";
import { theme } from "@/lib/design";
import DotPlotSeparateLegend from "../plots/DotPlotSeparateLegend";

export default function ListRanking() {
  
  const uns = useAppSelector((state) => state.plotReducer.anndata.uns.keys) as any;
  const selected = useAppSelector((state) => state.plotReducer.data.GDE.selected);
  const status = useAppSelector((state) => state.plotReducer.statusBackend.metadata);
  const gde = useAppSelector((state) => state.plotReducer.data.GDE);
  const config = useAppSelector((state) => state.plotReducer.plot.expression);
  const dispatch = useAppDispatch();
  
  const svgRef = useRef<SVGSVGElement>(null);
  
    useEffect(() => {
      let cleanUpFunction;
  
      if (svgRef.current && gde.expression && gde.dendrogram) {
        cleanUpFunction = DotPlotSeparateLegend({
          current: svgRef.current,
          gde: gde,
          config: config,
        });
      }
  
      return cleanUpFunction;
    }, [
      // counter,
      gde.expression,
      config.sortClustersBy,
      config.sortGenesBy,
      config.sortClustersByDirection,
      config.layer,
      config.highlight,
      config.expressionMin,
      config.expressionMax,
    ]);
  
  // const minExpr = 
  
  // const isValid = selected && (uns?.keys ?? []).includes(selected);
  
  // const [rankings, setRankings] = useState<string[]>([]);
  // const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleClose = () => {
  //   setAnchorEl(null);
  // };
  
  // useEffect(() => {
    
  //   if (uns) {
  //     const newRankings = Object.keys(uns)
  //       .filter((e: string) => e.includes("rank_genes_groups"))
      
  //     setRankings(newRankings)
  //   }
    
  // }, [uns])
  
  // if (status.inProgress) {
  //   return (
  //     <CurrentProgress
  //       status={status}
  //     />
  //   )
  // }
  
  console.log(selected, uns);

  if (selected && uns) {
    console.log(Object.keys(uns), uns[selected]);
  }
  
  return (
    <Stack
      direction="column"
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "100%",
        backgroundColor: theme.palette.background.paper,
      }}
      justifyContent="space-between"
    >
      <Box
        component="svg"
        ref={svgRef}
        width="100%"
        height="100%"
        // height="100%"
        // width={gde.nGenes ? 200 + (config.selected.length > 0 ? config.selected.length : gde.nGenes) * 15 : "100%"}
        // height={gde.nClusters ? gde.nClusters * 15 + 150 : "100%"}
        sx={{
          // position: "absolute",
          zIndex: 1,
        }}
        id="dotplot_legend"
      />

      {/* <Stack
        direction="column"
        sx={
          {
            // width: "100%",
            // height: "40vh",
            // overflowY: "auto",
          }
        }
      > */}
        {/* {gde && selected && uns[selected] ? (
          <Stack direction="column" padding={2} height="20%">
            <Stack direction="row" justifyContent="space-between">
              <Typography>Top genes per cluster </Typography>
              <Typography>{uns[selected!].params.n_top_genes}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography># of Genes</Typography>
              <Typography>{gde.nGenes}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography># of Clusters</Typography>
              <Typography>{gde.nClusters}</Typography>
            </Stack>
          </Stack>
        ) : (
          <></>
        )} */}

        {/* {isValid ? (
          // {uns.data[selected]}
        ) : (
          <></>
        )} */}

        {/* {rankings ? (
          rankings
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .map((e, i) => {
              return (
                <PopoverConnectivities
                  key={"popover_connectivities" + i}
                  title={e}
                  titleLabel="Ranking"
                  connectivityParams={uns[e].params}
                  anchorEl={anchorEl}
                  handleClick={handleClick}
                  handleClose={handleClose}
                  width={400}
                />
              );
            })
        ) : (
          <></>
        )} */}
      {/* </Stack> */}
    </Stack>
  );
}
