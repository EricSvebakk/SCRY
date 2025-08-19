
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { get_filenames } from "@/lib/fetch/get_filenames";
import CurrentProgress from "../OverlayCurrentProgress";
import { save_file_as } from "@/lib/fetch/workflow/save_file_as";

export default function DialogFileSaver(props: {
  isOpen: boolean;
  setIsOpen: Function;
}) {
  
  const status = useAppSelector((state) => state.plotReducer.status.get_filenames);
  const filenames = useAppSelector((state) => state.fileReducer.files);
  const activeFile = useAppSelector((state) => state.fileReducer.activeFile);
  
  const selectedObsClusters = useAppSelector((state) => state.plotReducer.filtering.selected.clusters);
  const selectedObs = useAppSelector((state) => state.plotReducer.anndata.obs.selectedKey);
  
  const [newFilename, setNewFilename] = useState<string>("");
  
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    get_filenames(dispatch);
  }, [])

  return (
    <Dialog
      open={props.isOpen}
      onClose={() => props.setIsOpen(false)}
      maxWidth="md"
    >
      <DialogTitle>Save File As</DialogTitle>
      <DialogContent
        sx={{
          p: 2,
          width: 600,
          maxWidth: 600,
          overflow: "hidden",
        }}
      >
        
        
        {status.inProgress ? (
          <Box
            sx={{
              height: 500,
            }}
          >
            <CurrentProgress status={status}/>
          </Box>
        ) : (
          <Stack
            direction="column" pt={2} rowGap={2}
          >
            <TextField
              variant="outlined"
              size="small"
              type="text"
              label="New file name"
              value={newFilename}
              onChange={(e) => setNewFilename(e.target.value)}
            />
            
            <Button
              variant="outlined"
              size="medium"
              onClick={() => {
                
                console.log(
                  filenames,
                  newFilename,
                  filenames.map((e) => e.id).includes(newFilename + ".h5ad")
                );
                
                const obsSelected = !!selectedObs
                const clustersSelected = !!selectedObsClusters
                const fileDoesNotExist = !filenames.map((e) => e.id).includes(newFilename + ".h5ad")
                
                if (obsSelected && clustersSelected && fileDoesNotExist) {
                  
                  save_file_as(
                    activeFile,
                    newFilename,
                    selectedObs,
                    selectedObsClusters,
                    dispatch
                  )
                  
                  props.setIsOpen(false);
                }

              }}
            >
              Start
            </Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
