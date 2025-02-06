
"use client"

import { Plot } from "@/lib/components/plot";
import { RootState } from "@/lib/redux/stores/store";
import { Circle } from "@mui/icons-material";
import { Box, Button, Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import { red } from "@mui/material/colors";

import { 
  useParams,
  // useRouter,
 } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSelector } from "react-redux";

async function fetchFileHierarchy(fileID: string, callback: Dispatch<SetStateAction<zarrHierarchy | null>>) {
  
  const endpoint = `http://localhost:8020/`;
  const request = `get_file_obs?file_id=${fileID}`;
  
  fetch(`${endpoint}${request}`)
  .then((response) => {
    if (!response.ok) {
      console.error("something fucky happened")
    }
    
    return response.json();
  })
  .then((data) => {
    console.log(data);
    callback(data);
  })
  .catch((error) => {
    console.error("something fucky", error);
  })
}

async function fetchFileObs(
  fileID: string,
  obs: string,
  callback1: Dispatch<SetStateAction<{
    coordinates: number[][],
    labels: string[]
    label_map: number[]
  } | null>>,
  // callback2: Dispatch<SetStateAction<null>>
) {
  const endpoint = `http://localhost:8020/`;
  const request1 = `get_file_obsm?file_id=${fileID}&obsm=X_umap&obs=${obs}`;

  fetch(`${endpoint}${request1}`)
    .then((response) => {
      if (!response.ok) {
        console.error("something fucky happened");
      }

      return response.json();
    })
    .then((data) => {
      callback1(JSON.parse(data));
    })
    .catch((error) => {
      console.error("something fucky", error);
    });
}

export default function FileIdPage({ }) {
  
  const { fileID } = useParams();
  const [hierarchy, setHierarchy] = useState<zarrHierarchy | null>(null);
  const [plotData, setPlotData] = useState<plotData | null>(null);
  
  useEffect(() => {
    
    if (typeof fileID === "string") {
      fetchFileHierarchy(fileID, setHierarchy);
    }
    
  }, [])
  
  return (
    <Grid
      container
      direction="row"
      // p={2}
      sx={
        {
          // border: "1px solid red",
        }
      }
    >
      <Grid item xs={4}>
        <Stack direction="column" gap={2}>
          <Stack direction="column">
            {hierarchy ? (
              hierarchy.obsm
                .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
                .map((e) => {
                  return (
                    <Button
                      key={`button_obsm_${e}`}
                      variant="contained"
                      onClick={() => {
                        if (typeof fileID === "string") {
                          fetchFileObs(fileID, e, setPlotData);
                        }
                      }}
                      size="small"
                      sx={{
                        justifyContent: "flex-start",
                        overflow: "hidden",
                        fontSize: 10,
                        // alignContent: "start"
                        // alignItems: ""
                      }}
                    >
                      {e}
                    </Button>
                  );
                })
            ) : (
              <></>
            )}
          </Stack>

          <Stack direction="column">
            {hierarchy ? (
              hierarchy.obs
                .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
                .map((e) => {
                  return (
                    <Button
                      key={`button_obs_${e}`}
                      variant="outlined"
                      onClick={() => {
                        if (typeof fileID === "string") {
                          fetchFileObs(fileID, e, setPlotData);
                        }
                      }}
                      size="small"
                      sx={{
                        justifyContent: "flex-start",
                        overflow: "hidden",
                        fontSize: 10,
                        // alignContent: "start"
                        // alignItems: ""
                      }}
                    >
                      {e}
                    </Button>
                  );
                })
            ) : (
              <></>
            )}
          </Stack>
        </Stack>
      </Grid>

      <Grid item width="fit-content" xs>
        <Plot plotData={plotData} />
      </Grid>
    </Grid>
  );
  
}

type zarrHierarchy = {
  X: string[];
  layers: string[];
  obs: string[];
  obsm: string[];
  obsp: string[];
  raw: string[];
  uns: string[];
  var: string[];
  varm: string[];
  varp: string[];
}

type plotData = {
  coordinates: number[][],
  labels: string[]
  label_map: number[]
}