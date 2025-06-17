
import {
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  setSelectedCategory,
} from "../../redux/reducers/plotReducer";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { RootState } from "../../redux/stores/store";
import { useState } from "react";
import { get_file_obs } from "../../fetch/get_file_obs";

export default function ListLabels() {
  
  const fileID = useAppSelector((state: RootState) => state.fileReducer.activeFile);
  
  const hierarchy = useAppSelector((state: RootState) => state.plotReducer.hierarchy);
  const obsm = useAppSelector((state: RootState) => state.plotReducer.obsm);
  
  const selectedCategory = useAppSelector((state: RootState) => state.plotReducer.selectedCategory);
  const selectedEmbedding = useAppSelector((state: RootState) => state.plotReducer.selectedEmbedding);
  
  const inProgress = useAppSelector((state) => state.plotReducer.inProgress.get_file_hierarchy)
  
  const dispatch = useAppDispatch();
  
  const [expanded, setExpanded] = useState(false);
  
  if (inProgress || !hierarchy) {
    return (
      <Stack
        sx={{
          height: "30vh",
          width: "100%",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CircularProgress size={100} color="primary"/>
      </Stack>
    );
  }
  
  return (
    <Stack
      direction="column"
      sx={{
        height: "30vh",
        width: "100%",
        overflowY: "auto",
      }}
    >
      {[...hierarchy.obs]
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map((e) => {
          return (
            <Button
              key={"accordion_" + e}
              disabled={selectedEmbedding === "" || obsm === null || selectedCategory == e}
              sx={{
                justifyContent: "start",
                overflowX: "clip",
                fontWeight: selectedCategory === e ? "bold" : ""
              }}
              size="small"
              onClick={() => {
                if (selectedCategory !== e) {
                  setExpanded(true);
                  
                  dispatch(setSelectedCategory(e));
                  get_file_obs(fileID, e, dispatch);
                }
                else {
                  setExpanded(!expanded);
                }
              }}
            >
              {e}
            </Button>
          );
        })}
    </Stack>
  )
  
}