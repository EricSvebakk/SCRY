
import {
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { RootState } from "../../redux/stores/store";

export default function OptionsLDR() {
  
  const hierarchy = useAppSelector((state: RootState) => state.plotReducer.hierarchy);
  const inProgress = useAppSelector((state) => state.plotReducer.inProgress.get_file_hierarchy)
  
  const dispatch = useAppDispatch();
  
  if (inProgress || !hierarchy) {
    return (
      <Stack
        sx={{
          height: "100%",
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
        width: "100%",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <Button>
        
      </Button>
      
    </Stack>
  )
  
}