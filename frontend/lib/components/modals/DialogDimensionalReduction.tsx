import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { theme } from "@/app/layout";
import { useCeleryFileNLDRMutation } from "@/lib/redux/api/api";
import { pollTaskStatus } from "@/lib/util/handlerPollingTaskStatus";
import { setAnndataField } from "@/lib/redux/reducers/plotReducer";

export default function DialogDimensionalReduction(props: {
  isOpen: boolean;
  setIsOpen: Function;
}) {
  const activeFile = useAppSelector((state) => state.fileReducer.activeFile);
  const userID = useAppSelector((state) => state.fileReducer.userID);

  const dispatch = useAppDispatch();
  const [getNLDR] = useCeleryFileNLDRMutation();
  
  const [adataKey, setAdataKey] = useState<string>("");
  const [numPCs, setNumPCs] = useState<number>(30);
  const [minDist, setMinDist] = useState<number>(0.5);
  const [spread, setSpread] = useState<number>(1.0);
  const [nNeighbors, setNNeighbors] = useState<number>(15);
  
  return (
    <Dialog
      open={props.isOpen}
      onClose={() => props.setIsOpen(false)}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle alignSelf="center">
        <Tooltip
          title="This will generate both a linear and a non-linear dimensional reduction"
          placement="bottom"
        >
          <Typography fontSize={theme.typography.fontSize}>
            Create Embedding (PCA & UMAP)
          </Typography>
        </Tooltip>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <Stack direction="column" rowGap={4} pt={1}>
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

          <Stack direction="column" rowGap={2}>
            <TextField
              variant="outlined"
              size="small"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              label="# of Principal Components"
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
              onChange={(event) =>
                setNNeighbors(parseFloat(event.target.value))
              }
            />
            <Button
              variant="outlined"
              size="medium"
              onClick={() => {
                
                getNLDR({
                  fileID: activeFile,
                  userID,
                  adataKey,
                  numPCs,
                  minDist,
                  spread,
                  nNeighbors,
                })
                .then((data) => {
                  
                  if (data.data?.ok) {
                    pollTaskStatus(
                      data.data.response,
                      "celeryFileLDR",
                      dispatch,
                      () => {
                        dispatch(
                          setAnndataField({
                            attribute: "obsm",
                            field: "selectedKey",
                            value: `X_umap_${adataKey}`,
                          })
                        );
                        
                      }
                    )
                  }
                  
                })

                props.setIsOpen(false);
              }}
            >
              Start
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
