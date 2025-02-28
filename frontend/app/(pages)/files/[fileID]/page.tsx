
"use client"

import CategoryAccordion from "@/lib/components/CategoryAccordion";
import { Labels } from "@/lib/components/labels";
import { Plot } from "@/lib/components/plot";
import { my_colors } from "@/lib/components/scatterplot";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { reset, setHierarchy, setObs, setObsm, setSelectedEmbedding } from "@/lib/redux/reducers/plotReducer";
import { selectFile, setActiveFile } from "@/lib/redux/reducers/fileReducer";
import { RootState } from "@/lib/redux/stores/store";
// import { useAppSelector } from "@/lib/redux/hooks/hooks";
import { obsData, obsmData, TooltipKey, tooltips, zarrHierarchy } from "@/lib/types";
import { Circle, Square } from "@mui/icons-material";
import { Box, Button, Divider, Grid, Icon, Stack, Tooltip, Typography } from "@mui/material";
// import { RootState } from "@reduxjs/toolkit/query";

import { 
  useParams,
 } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

function fetchFileHierarchy(
  fileID: string,
  callback: Function
) {
  
  // const dispatch = useAppDispatch();
  
  const request = `${BACKEND_ENDPOINT}/get_file_hierarchy?file_id=${fileID}`;
  
  fetch(request
    // {
    //   mode: "no-cors"
    // }
  )
  .then((response) => {
    if (!response.ok) {
      console.error("something fucky happened")
    }
    
    return response.json();
  })
  .then((data) => {
    console.log(data);
    
    callback(setHierarchy(data));
    // callback(data);
  })
  .catch((error) => {
    console.error("something fucky", error);
  })
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
      // callback(JSON.parse(data));
    })
    .catch((error) => {
      console.error("something fucky", error);
    });
}

export default function FileIdPage({ }) {
  
  const [selectedObs, setSelectedObs] = useState("");
  const [selectedObsm, setSelectedObsm] = useState("");
  
  // const [obsData, setObsData] = useState<obsData | null>(null);
  // const [obsmData, setObsmData] = useState<obsmData | null>(null);
  
  const { fileID } = useParams();
  // const [hierarchy, setHierarchy] = useState<zarrHierarchy | null>(null);
  
  const selectedFiles = useAppSelector((state: RootState) => state.fileReducer.selectedFiles);
  
  const hierarchy = useAppSelector((state: RootState) => state.plotReducer.hierarchy)
  const obs = useAppSelector((state: RootState) => state.plotReducer.obs);
  const obsm = useAppSelector((state: RootState) => state.plotReducer.obsm);
  
  const selectedEmbedding = useAppSelector((state: RootState) => state.plotReducer.selectedEmbedding);
  
  
  
  const dispatch = useAppDispatch();
  
  console.log(hierarchy)
  
  const w1 = 3;
  const w2 = 3;
  const w3 = 3;
  const w4 = 3;
  
  // console.log(selectedFiles, fileID, typeof fileID === "string" ? selectedFiles.includes(fileID) : undefined)
  
  
  useEffect(() => {
    
    if (obs) {
      dispatch(reset(true));
    }
    
    if (typeof fileID === "string") {
      fetchFileHierarchy(fileID, dispatch);
      dispatch(setActiveFile(fileID));
      // if (!selectedFiles.includes(fileID)) {
      //   dispatch(selectFile(fileID));
      // }
    }
    
  }, [])
  
  return (
    <Grid container direction="row" mt={1} columnGap={1}>
      <Grid
        item
        xs={w1}
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
                            console.log(tooltips[e as TooltipKey], e);
                            // setSelectedObs(e);
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
              scrollbarWidth: "thin"
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
        <Plot />
      </Grid>

      <Grid
        item
        xs
        border="1px solid red"
        padding={2}
        textOverflow="ellipsis"
        overflow="hidden"
      ></Grid>
    </Grid>
  );
  
}