
import {
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  setCurrentTab,
  setSelectedEmbedding,
} from "../../redux/reducers/plotReducer";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { RootState } from "../../redux/stores/store";
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
          height: "100%",
          width: "100%",
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
        width: "100%",
        height: "100%",
        overflowY: "auto",
      }}
    >
      {[...hierarchy.obsm]
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map((e) => {
          return (
            <Stack
              key={"stack" + e}
              direction="row"
            >
              <Button
                fullWidth
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
                  dispatch(setCurrentTab("scatterplot"));
                  get_file_obsm(fileID, e, dispatch);
                }}
              >
                {e}
              </Button>
            </Stack>
          );
        })}
    </Stack>
  )
  
}