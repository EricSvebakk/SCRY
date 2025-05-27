
import {
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  setSelectedCategory,
  setSelectedEmbedding,
} from "../../redux/reducers/plotReducer";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { RootState } from "../../redux/stores/store";
import { useState } from "react";
import { get_file_obs } from "../../fetch/get_file_obs";
import { get_file_obsm } from "@/lib/fetch/get_file_obsm";

export default function ListEmbeddings() {
  
  const fileID = useAppSelector((state: RootState) => state.fileReducer.activeFile);
  const hierarchy = useAppSelector((state: RootState) => state.plotReducer.hierarchy);
  const selectedEmbedding = useAppSelector((state: RootState) => state.plotReducer.selectedEmbedding);
  const inProgress = useAppSelector((state) => state.plotReducer.inProgress.get_file_hierarchy)
  
  const dispatch = useAppDispatch();
  
  if (inProgress || !hierarchy) {
    return (
      <Stack
        sx={{
          height: "15vh",
          width: "100%",
          border: "1px solid grey",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CircularProgress size={60} color="primary"/>
      </Stack>
    );
  }
  
  return (
    <Stack
      direction="column"
      sx={{
        border: "1px solid grey",
        height: "15vh",
        overflowY: "auto"
      }}
    >
      {[...hierarchy.obsm]
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map((e) => {
          return (
            <Button
              key={"accordion_" + e}
              // disabled={selectedEmbedding === ""s || obsm === null}
              disabled={selectedEmbedding === e}
              sx={{
                justifyContent: "start",
                overflowX: "clip",
                fontWeight: selectedEmbedding === e ? "bold" : ""
              }}
              size="small"
              onClick={() => {
                dispatch(setSelectedEmbedding(e));
                get_file_obsm(fileID, e, dispatch);

              }}
            >
              {e}
            </Button>
          );
        })}
    </Stack>
  )
  
}