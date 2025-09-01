import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { get_ldr } from "@/lib/fetch/workflow/get_ldr";

export default function LDRDialog(props: {
  isOpen: boolean;
  setIsOpen: Function;
}) {
  const activeFile = useAppSelector((state) => state.fileReducer.activeFile);

  const dispatch = useAppDispatch();
  const [numPCs, setNumPCs] = useState<number>(30);

  return (
    <Dialog open={props.isOpen} onClose={() => props.setIsOpen(false)}>
      <DialogTitle>LDR - PCA</DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <Stack direction="column" rowGap={2} pt={1}>
          <TextField
            variant="outlined"
            size="small"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            label="# of PCs"
            value={numPCs}
            onChange={(event) => setNumPCs(parseFloat(event.target.value))}
          />
          <Button
            variant="outlined"
            size="medium"
            onClick={() => {
              get_ldr(activeFile, numPCs, dispatch);

              props.setIsOpen(false);
            }}
          >
            Start
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
