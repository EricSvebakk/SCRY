

import { Autocomplete, Box, Collapse, Grid, IconButton, Stack, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { theme } from "@/lib/design";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { AutocompleteOption, Cluster, Reclustering } from "@/lib/types";
import { Close } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { useFileReclusterMutation, useLazyHierarchyQuery } from "@/lib/redux/api/api";
import { pollTaskStatus } from "@/lib/util/handlerPollingTaskStatus";

export default function PanelReclustering(props: {
  open: boolean;
  setOpen: Function;
}) {
  
  const fileID = useAppSelector((state) => state.plotReducer.system.files.active);
  const userID = useAppSelector((state) => state.plotReducer.system.user.id);
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs);
  const statusObs = useAppSelector((state) => state.plotReducer.status.Obs);
  const statusNewObs = useAppSelector((state) => state.plotReducer.status.FileRecluster);
  
  const [observationName, setObservationName] = useState<string>("");
  const [catOptions, setCatOptions] = useState<AutocompleteOption[]>([]);
  const [clusterNames, setClusterNames] = useState<string[]>([]);
  const [clusters, setClusters] = useState<AutocompleteOption[][]>([]);
  
  const ref = useRef();
  const dispatch = useAppDispatch();
  const [getReclustering] = useFileReclusterMutation();
  const [getHierarchy] = useLazyHierarchyQuery();
  
  useEffect(() => {
    if (obs.selectedKey && obs.indices) {
      const newCatOptions: AutocompleteOption[] = obs.indices.categories.map((e, i) => ({ label: e as string, id: i }));
      setCatOptions(newCatOptions);
      setClusters([]);
      setClusterNames([]);
    }
  }, [obs]);
  
  return (
    <Collapse
      unmountOnExit
      ref={ref}
      in={props.open}
      orientation="horizontal"
      sx={{
        position: "absolute",
        right: 85,
        top: 0,
        height: "100%",
        zIndex: 500,
      }}
    >
      <Box
        sx={{
          width: 300,
          height: "100vh",
          p: "1vh",
          borderLeft: "1px solid grey",
          backgroundColor: theme.palette.primary.main,
          WebkitBoxShadow: "-1px 0 2px -1px #000000",
          boxShadow: "-1px 0 2px -1px #000000",
        }}
      >
        <Stack
          direction="column"
          rowGap={1.5}
          sx={{
            p: 1,
            pt: 2,
            height: "96vh",
            backgroundColor: theme.palette.background.paper,
            border: "1px solid grey"
          }}
        >
          <TextField
            variant="outlined"
            size="small"
            disabled={!obs.selectedKey}
            InputLabelProps={{
              shrink: true,
            }}
            label="label observation"
            value={observationName}
            onChange={(event) => setObservationName(event.target.value)}
          />
          
          <TextField
            variant="outlined"
            size="small"
            disabled
            label="base"
            InputLabelProps={{
              shrink: true,
            }}
            value={obs.selectedKey ? obs.selectedKey : "[Please select observation]"}
          />
          
          <LoadingButton
            variant="contained"
            loading={statusObs.inProgress}
            disabled={!obs.selectedKey}
            onClick={() => {
              setClusters([...clusters, []])
              setClusterNames([...clusterNames, ""]);
            }}
            sx={{
              border: "1px solid grey"
            }}
          >
            + Add cluster
          </LoadingButton>
          
          <Stack
            direction="column"
            rowGap={1}
            sx={{
              height: "100%",
              overflowY: "scroll",
            }}
          >
            {clusters.map((cluster, i) => (
              <ReclusteringField
                key={"reclustering_field_" + i}
                categories={catOptions}
                clusters={clusters}
                clusterNames={clusterNames}
                clusterIndex={i}
                setCluster={(newCluster) => {
                  setClusters(clusters.map((c, j) => j === i ? newCluster : c))
                }}
                setClusterName={(newName) => {
                  setClusterNames(clusterNames.map((c, j) => j === i ? newName : c))
                }}
                removeCluster={() => {
                  setClusters(clusters.filter((e, j) => j !== i));
                  setClusterNames(clusterNames.filter((e, j) => j !== i));
                }}
              />
            ))}
          </Stack>
          
          <LoadingButton
            variant="contained"
            loading={statusObs.inProgress || statusNewObs.inProgress}
            disabled={!obs.selectedKey}
            fullWidth
            sx={{
              border: "1px solid grey"
            }}
            onClick={() => {
              
              if (observationName !== "" && obs.selectedKey && clusters.length > 0) {
                const newObservation: Reclustering = {
                  file: fileID,
                  name: observationName,
                  base: obs.selectedKey,
                  clusters: clusters.map((cluster, index) => ({
                    label: clusterNames[index],
                    subclusters: cluster.map((subcluster) => subcluster.label)
                  }) as Cluster)
                };
                
                getReclustering({
                  reclustering: newObservation,
                }).then((data) => {
                  if (data.data?.ok) {
                    pollTaskStatus(
                      data.data.response,
                      data.data.timestamp,
                      "celeryFileRecluster",
                      dispatch,
                      () => {
                        getHierarchy();
                      }
                    );
                  }
                })
              }
              
            }}
          >
            Create observation
          </LoadingButton>
          
        </Stack>

      </Box>
    </Collapse>
  );
  
}

function ReclusteringField(props: {
  categories: AutocompleteOption[];
  clusters: AutocompleteOption[][];
  clusterNames: string[];
  clusterIndex: number;
  setCluster: (data: AutocompleteOption[]) => void;
  setClusterName: (data: string) => void;
  removeCluster: () => void;
}) {
  
  return (
    <Grid
      container
      direction="column"
    >
      
      <Grid item xs>
        <Stack
          direction="column"
          rowGap={1}
          sx={{
            p: 1,
            pt: 2,
            backgroundColor: theme.palette.secondary.main,
            border: "1px solid grey",
            borderRadius: "4px"
          }}
        >
          <Stack
            direction="row"
            width="100%"
            columnGap={1}
          >        
            <TextField
              variant="outlined"
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
              label={`label cluster ${props.clusterIndex + 1}`}
              placeholder=""
              value={props.clusterNames[props.clusterIndex]}
              onChange={(event) => props.setClusterName(event.target.value)}
              fullWidth
            />
            
            <IconButton
              sx={{
                border: "1px solid grey",
                borderRadius: "4px"
              }}
              size="small"
              onClick={() => {
                props.removeCluster();
              }}
            >
              <Close/>
            </IconButton>
          </Stack>
          
          <Autocomplete
            disabled={props.categories.length === 0}
            size="small"
            fullWidth
            multiple
            value={props.clusters[props.clusterIndex]}
            options={props.categories}
            onChange={(event: any, value: any) => props.setCluster(value)}
            getOptionLabel={(option) => (option as AutocompleteOption).label}
            getOptionDisabled={(option) => props.clusters.flat().includes(option)}
            isOptionEqualToValue={(option, value) =>
              (option as AutocompleteOption).id ===
              (value as AutocompleteOption).id
            }
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  label="include from base"
                  InputLabelProps={{ shrink: true }}
                />
              );
            }}
          />
          
        </Stack>
      </Grid>
      
    </Grid>
  );
}