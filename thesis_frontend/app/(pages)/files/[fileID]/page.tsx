
"use client"

import { RootState } from "@/lib/redux/stores/store";
import { Circle } from "@mui/icons-material";
import { Box, Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { red } from "@mui/material/colors";

import { 
  useParams,
  // useRouter,
 } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSelector } from "react-redux";

async function fetchFile(fileID: string, callback: Dispatch<SetStateAction<hierarchy | null>>) {
  
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
  
  // return data;
}

type hierarchy_base = {
  type: string;
  path: string;
}

type hierarchy_children = {
  X: hierarchy_base | hierarchy;
  layers: hierarchy_base | hierarchy;
  obs: hierarchy_base | hierarchy;
  obsm: hierarchy_base | hierarchy;
  obsp: hierarchy_base | hierarchy;
  raw: hierarchy_base | hierarchy;
  uns: hierarchy_base | hierarchy;
  var: hierarchy_base | hierarchy;
  varm: hierarchy_base | hierarchy;
  varp: hierarchy_base | hierarchy;
}

type hierarchy = {
  type: string;
  path: string;
  children: hierarchy_children
};

export default function FileIdPage({ }) {
  
  const { fileID } = useParams();
  const [hierarchy, setHierarchy] = useState<hierarchy | null>(null);
  
  useEffect(() => {
    
    if (typeof fileID === "string") {
      fetchFile(fileID, setHierarchy);
    }
    
  }, [])
  
  console.log(fileID, hierarchy, typeof hierarchy);
  
  const files = useSelector((state: RootState) => state.fileReducer.files);
  
  console.log(files);
  
  return (
    <Grid
      container
      direction="row"
      p={2}
      sx={{
        border: "1px solid red"
      }}
    >
      <Grid item sx={{ border: "1px solid red" }} p={2}>
        {
        hierarchy ? 
        Object.keys(hierarchy.children).map((e: string) => {
          
          return (
            <Box>
              <Typography fontWeight="bold">{e}</Typography>

              <List>
                {
                  hierarchy.children[e].type === "group" ?
                    Object.keys(hierarchy.children[e].children).map((f) => {
                      return (
                        <ListItem>
                          <ListItemText primary={f} />
                        </ListItem>
                      );
                    })
                    : <></>
                }
              </List>
            </Box>
          );
          
        })
        : <></>
      }
      </Grid>
      <Grid item sx={{ border: "1px solid red" }} p={2}>
        stuff
      </Grid>
    </Grid>
  )
  
}