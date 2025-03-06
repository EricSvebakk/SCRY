
"use client"

import {
  reset,
  setGenes,
  setHierarchy,
  setObsm,
  setSelectedEmbedding,
} from "@/lib/redux/reducers/plotReducer";
import {
  Button,
  Divider,
  Grid,
  Stack,
  Tooltip,
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

export default function FileIdPage({ }) {
  
  const { fileID } = useParams();
  
  const hierarchy = useAppSelector((state) => state.plotReducer.hierarchy)
  const obs = useAppSelector((state) => state.plotReducer.obs);
  const genes = useAppSelector((state) => state.plotReducer.genes);
  
  const [selectedGene, setSelectedGene] = useState<string[]>([])
  const selectedEmbedding = useAppSelector((state) => state.plotReducer.selectedEmbedding);
  
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
    
  }, [])
  
  return (
    <Grid
      container
      direction="row"
      mt={1}
      columnGap={1}
      height="100%"
    >
      <Grid
        item
        xs={3}
        p={2}
        width="fit-content"
        height="100%"
        sx={{
          border: "1px solid green",
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
        height={500}
        width={500}
        sx={{
          border: "1px solid blue",
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
      >
        <Stack direction="column" gap={2} height="100%">     
          <GeneAutocomplete
            values={selectedGene}
            options={genes}
            callback={setSelectedGene}
            error={false} // TODO: implement error-handling
            isDisabled={genes.length === 0}
          />
          <DotPlot />
        </Stack>
      </Grid>
    </Grid>
  );
  
}