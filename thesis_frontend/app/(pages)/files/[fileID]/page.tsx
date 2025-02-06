
"use client"

import { Plot } from "@/lib/components/plot";
import { Button, Divider, Grid, Stack } from "@mui/material";

import { 
  useParams,
 } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";


async function fetchFileHierarchy(fileID: string, callback: Dispatch<SetStateAction<zarrHierarchy | null>>) {
  
  const endpoint = `http://localhost:8020/`;
  const request = `get_file_hierarchy?file_id=${fileID}`;
  
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
  obs: string | null,
  callback: Dispatch<SetStateAction<obsData | null>>
) {
  const endpoint = `http://localhost:8020/`;
  const request = `get_file_obs?file_id=${fileID}&obs=${obs}`;

  fetch(`${endpoint}${request}`)
    .then((response) => {
      if (!response.ok) {
        console.error("something fucky happened");
      }
      return response.json();
    })
    .then((data) => {
      callback(JSON.parse(data));
    })
    .catch((error) => {
      console.error("something fucky", error);
    });
}

async function fetchFileObsm(
  fileID: string,
  obsm: string | null,
  callback: Dispatch<SetStateAction<obsmData | null>>
) {
  const endpoint = `http://localhost:8020/`;
  const request = `get_file_obsm?file_id=${fileID}&obsm=${obsm}`;

  fetch(`${endpoint}${request}`)
    .then((response) => {
      if (!response.ok) {
        console.error("something fucky happened");
      }
      return response.json();
    })
    .then((data) => {
      callback(JSON.parse(data));
    })
    .catch((error) => {
      console.error("something fucky", error);
    });
}

export default function FileIdPage({ }) {
  
  const [selectedObs, setSelectedObs] = useState("");
  const [selectedObsm, setSelectedObsm] = useState("");
  
  const [obsData, setObsData] = useState<obsData | null>(null);
  const [obsmData, setObsmData] = useState<obsmData | null>(null);
  
  const { fileID } = useParams();
  const [hierarchy, setHierarchy] = useState<zarrHierarchy | null>(null);
  
  useEffect(() => {
    if (typeof fileID === "string") {
      fetchFileHierarchy(fileID, setHierarchy);
    }
  }, [])
  
  return (
    <Grid
      container
      direction="row"
      mt={1}
      columnGap={1}
    >
      <Grid
        item
        xs={3}
        p={2}
        sx={{
          border: "1px solid grey",
        }}
      >
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
                      disabled={selectedObs === e}
                      onClick={() => {
                        if (typeof fileID === "string") {
                          setSelectedObs(e)
                          fetchFileObsm(fileID, e, setObsmData);
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
                  );
                })
            ) : (
              <></>
            )}
          </Stack>

          {hierarchy ? <Divider/> : <></>}

          <Stack direction="column">
            {hierarchy ? (
              hierarchy.obs
                .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
                .map((e) => {
                  return (
                    <Button
                      key={`button_obs_${e}`}
                      variant="contained"
                      disabled={!obsmData || selectedObsm === e}
                      onClick={() => {
                        if (typeof fileID === "string") {
                          setSelectedObsm(e);
                          fetchFileObs(fileID, e, setObsData);
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
                  );
                })
            ) : (
              <></>
            )}
          </Stack>
        </Stack>
      </Grid>

      <Grid
        item
        width="fit-content"
        xs
        p={2}
        sx={{
          border: "1px solid grey",
        }}
      >
        <Plot obsData={obsData} obsmData={obsmData} />
      </Grid>
    </Grid>
  );
  
}


export type obsData = {
  labels: string[];
  label_map: number[];
}

export type obsmData = {
  coordinates: number[][]
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
