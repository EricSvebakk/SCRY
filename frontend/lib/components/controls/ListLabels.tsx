
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  setSelectedCategory,
  setSelectedLabels,
} from "../../redux/reducers/plotReducer";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { RootState } from "../../redux/stores/store";
import { Square } from "@mui/icons-material";
import { my_colors } from "../ScatterPlotGenerator";
import { useState } from "react";
import { theme } from "@/app/layout";
import { get_file_obs } from "../../fetch/get_file_obs";

export default function ListLabels() {
  
  const fileID = useAppSelector((state: RootState) => state.fileReducer.activeFile);
  
  const obsm = useAppSelector((state: RootState) => state.plotReducer.obsm);
  
  const hierarchy = useAppSelector((state: RootState) => state.plotReducer.hierarchy);
  
  const selectedCategory = useAppSelector((state: RootState) => state.plotReducer.selectedCategory);
  const selectedEmbedding = useAppSelector((state: RootState) => state.plotReducer.selectedEmbedding);
  // const selectedCat = useAppSelector((state: RootState) => state.plotReducer.selectedCategory);
  
  const inProgress = useAppSelector((state) => state.plotReducer.inProgress.get_file_hierarchy)
  
  const dispatch = useAppDispatch();
  
  const [expanded, setExpanded] = useState(false);
  
  if (inProgress || !hierarchy) {
    return (
      <Stack
        sx={{
          height: "30vh",
          width: "100%",
          border: "1px solid grey",
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
        border: "1px solid grey",
        height: "30vh",
        overflowY: "auto"
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
                  // fetchFileObs(fileID, e, dispatch);
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