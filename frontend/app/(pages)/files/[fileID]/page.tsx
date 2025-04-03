
"use client"

import {
  reset,
  setSelectedEmbedding,
} from "@/lib/redux/reducers/plotReducer";
import {
  Button,
  Divider,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CategoryAccordion from "@/lib/components/CategoryAccordion";
import { ScatterPlot } from "@/lib/components/ScatterPlot";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { setActiveFile } from "@/lib/redux/reducers/fileReducer";
import { TooltipKey, tooltips } from "@/lib/types";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { DotPlot } from "@/lib/components/DotPlot";
import GeneAutocomplete from "@/lib/components/GeneAutocomplete";
import { get_file_hierarchy } from "@/lib/fetch/get_file_hierarchy";
import { get_file_obsm } from "@/lib/fetch/get_file_obsm";

export default function FileIdPage({ }) {
  
  const { fileID } = useParams();
  
  const hierarchy = useAppSelector((state) => state.plotReducer.hierarchy)
  const obs = useAppSelector((state) => state.plotReducer.obs);
  
  const selectedEmbedding = useAppSelector((state) => state.plotReducer.selectedEmbedding);
  const selectedCategory = useAppSelector((state) => state.plotReducer.selectedCategory);
  const selectedLabels = useAppSelector((state) => state.plotReducer.selectedLabels);
  const selectedGenes = useAppSelector((state) => state.plotReducer.selectedGenes);
  
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    
    if (obs) {
      dispatch(reset(true));
    }
    
    if (typeof fileID === "string") {
      dispatch(setActiveFile(fileID));
      
      get_file_hierarchy(fileID, dispatch);
    }
    
  }, []);

  
  return (
    <Grid container direction="row" columnGap={1} height="100%">
      <Grid
        item
        xs={3}
        p={1}
        width="fit-content"
        height="100%"
        sx={{
          border: "1px solid green"
        }}
        overflow="clip"
      >
        <Stack direction="column" gap={2}>
          <Stack direction="column">
            {hierarchy ? (
              [...hierarchy.obsm]
                .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
                .map((e) => {
                  return (
                    <Tooltip
                      key={`tooltip_obsm_${e}`}
                      title={tooltips[e as TooltipKey]}
                      placement="right"
                    >
                      <Button
                        key={`button_obsm_${e}`}
                        variant="contained"
                        disabled={selectedEmbedding === e}
                        onClick={() => {
                          if (typeof fileID === "string") {
                            dispatch(setSelectedEmbedding(e));
                            get_file_obsm(fileID, e, dispatch);
                            // fetchFileObsm(fileID, e, dispatch);
                          }
                        }}
                        size="small"
                        sx={{
                          justifyContent: "flex-start",
                          overflow: "hidden",
                          fontSize: 10,
                        }}
                      >
                        {e}
                      </Button>
                    </Tooltip>
                  );
                })
            ) : (
              <></>
            )}
          </Stack>

          {hierarchy ? <Divider /> : <></>}

          <Stack
            direction="column"
            gap={2}
            height="69vh"
            sx={{
              overflowY: "scroll",
              scrollbarWidth: "thin",
            }}
          >
            <CategoryAccordion />
          </Stack>
        </Stack>
      </Grid>

      <Grid
        item
        // xs
        height={500}
        width={500}
        sx={{
          border: "1px solid blue"
        }}
      >
        <ScatterPlot />
      </Grid>

      <Grid
        item
        xs
        border="1px solid red"
        padding={2}
        textOverflow="ellipsis"
        overflow="hidden"
        sx={
          {
            // backgroundColor: theme.palette.background.paper,
          }
        }
      >
        <Grid container direction="column" gap={1} height="100%">
          <Grid item>
            <GeneAutocomplete />
          </Grid>
          <Grid item>
            <Tooltip
              title="Generate Differential Gene Expression with the selected genes"
              placement="right"
            >
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  // fetchObsLabelExpression(
                  //   fileID as string,
                  //   selectedCategory,
                  //   selectedLabels,
                  //   selectedGenes,
                  //   dispatch
                  // );
                }}
              >
                <Typography variant="subtitle2">
                  Generate DGE
                </Typography>
              </Button>
            </Tooltip>
          </Grid>
          <Grid item xs>
            <DotPlot />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
  
}