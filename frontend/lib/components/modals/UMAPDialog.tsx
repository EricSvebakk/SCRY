import { Button, Dialog, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { generate_umap } from "../../fetch/generate_umap";

export default function UMAPDialog(props: {
  isOpen: boolean;
  setIsOpen: Function
}) {
  
  const activeFile = useAppSelector((state) => state.fileReducer.activeFile);
  
  const dispatch = useAppDispatch();
  const [adataKey, setAdataKey] = useState<string>("");
  const [numPCs, setNumPCs] = useState<number>(30);
  const [minDist, setMinDist] = useState<number>(0.5);
  const [spread, setSpread] = useState<number>(1.0);
  const [nNeighbors, setNNeighbors] = useState<number>(15);
  
  return (
    <Dialog open={props.isOpen} onClose={() => props.setIsOpen(false)}>
      <DialogTitle>Please provide an attribute key</DialogTitle>
      <DialogContent>
        <Stack direction="column" rowGap={2} pt={2}>
          <TextField
            variant="outlined"
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            label="User-added key"
            placeholder="key"
            value={adataKey}
            onChange={(event) => setAdataKey(event.target.value)}
          />
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
          <TextField
            variant="outlined"
            size="small"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            label="Minimum Distance"
            inputProps={{
              step: 0.1,
            }}
            value={minDist}
            onChange={(event) => setMinDist(parseFloat(event.target.value))}
          />
          <TextField
            variant="outlined"
            size="small"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 0.1,
            }}
            label="Spread"
            value={spread}
            onChange={(event) => setSpread(parseFloat(event.target.value))}
          />
          <TextField
            variant="outlined"
            size="small"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            label="# of Neighbors"
            value={nNeighbors}
            onChange={(event) => setNNeighbors(parseFloat(event.target.value))}
          />
          <Button
            variant="outlined"
            size="medium"
            onClick={() => {
              generate_umap(
                activeFile,
                adataKey,
                numPCs,
                minDist,
                spread,
                nNeighbors,
                dispatch
              );

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