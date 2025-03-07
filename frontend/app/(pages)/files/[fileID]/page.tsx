
"use client"

import {
  reset,
  setGenes,
  setHierarchy,
  setObsExpression,
  setObsm,
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
import { RootState } from "@/lib/redux/stores/store";
import { TooltipKey, tooltips } from "@/lib/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DotPlot } from "@/lib/components/DotPlot";
import GeneAutocomplete from "@/lib/components/GeneAutocomplete";
import { theme } from "@/app/layout";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

function fetchFileHierarchy(
  fileID: string,
  callback: Function
) {
  
  const request = `${BACKEND_ENDPOINT}/get_file_hierarchy?file_id=${fileID}`;
  
  fetch(request)
  .then((response) => {
    if (!response.ok) {
      console.error("something fucky happened")
    }
    return response.json();
  })
  .then((data) => {
    console.log(data);
    callback(setHierarchy(data));
  })
  .catch((error) => {
    console.error("something fucky", error);
  })
}

function fetchGenes(
  fileID: string,
  callback: Function
) {

  const request = `${BACKEND_ENDPOINT}/get_genes?file_id=${fileID}`;

  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("something fucky happened");
      }
      return response.json();
    })
    .then((data) => {
      // console.log(data);
      callback(setGenes(data));
    })
    .catch((error) => {
      console.error("something fucky", error);
    });
  
}

async function fetchFileObsm(
  fileID: string,
  obsm: string | null,
  callback: Function,
) {
  const request = `${BACKEND_ENDPOINT}/get_file_obsm?file_id=${fileID}&obsm=${obsm}`;

  fetch(request)
    .then((response) => {
      if (!response.ok) {
        console.error("something fucky happened");
      }
      return response.json();
    })
    .then((data) => {
      callback(setObsm(JSON.parse(data)));
    })
    .catch((error) => {
      console.error("something fucky", error);
    });
}

async function fetchObsLabelExpression(
  fileID: string,
  selectedCategory: string,
  selectedLabels: string[],
  selectedGenes: string[],
  callback: Function
) {
  const request = `${BACKEND_ENDPOINT}/get_top_gene_expression/`;

  const formData = new FormData();
  formData.append("file_id", fileID);
  formData.append("obs", selectedCategory);

  selectedLabels.forEach((label: string) => {
    formData.append("labels", label);
  });
  
  selectedGenes.forEach((gene: string) => {
    formData.append("genes", gene);
  });

  fetch(request, {
    method: "POST",
    mode: "cors",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        console.error("something expression fucky happened");
      }
      return response.json();
    })
    .then((data) => {
      callback(setObsExpression(JSON.parse(data)));
    })
    .catch((error) => {
      console.error("something fucky", error);
    });
}

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
      fetchFileHierarchy(fileID, dispatch);
      fetchGenes(fileID, dispatch);
      dispatch(setActiveFile(fileID));
    }
    
  }, []);
  
  useEffect(() => {
    
    
    
  }, [selectedGenes, selectedLabels])
  
  return (
    <Grid container direction="row" mt={1} columnGap={1} height="100%">
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
                            fetchFileObsm(fileID, e, dispatch);
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
        height={600}
        width={600}
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
                  fetchObsLabelExpression(
                    fileID as string,
                    selectedCategory,
                    selectedLabels,
                    selectedGenes,
                    dispatch
                  );
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