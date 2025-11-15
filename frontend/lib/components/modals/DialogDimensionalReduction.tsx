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
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { theme } from "@/lib/design";
import { useCeleryFileNLDRMutation, useLazyFileHierarchyQuery } from "@/lib/redux/api/api";
import { pollTaskStatus } from "@/lib/util/handlerPollingTaskStatus";
import { setAnndataField } from "@/lib/redux/reducers/plotReducer";
import { LoadingButton } from "@mui/lab";
import { toNumber, validateNumber } from "@/lib/util/validateNumber";
import DialogTitleHelp from "../custom/DialogTitle";

export default function DialogDimensionalReduction(props: {
  isOpen: boolean;
  setIsOpen: Function;
}) {
  
  const embeddingKeys = useAppSelector((state) => state.plotReducer.anndata.obsm.keys);
  const uns = useAppSelector((state) => state.plotReducer.anndata.uns.keys) as any;
  
  const dispatch = useAppDispatch();
  const [getNLDR] = useCeleryFileNLDRMutation();
  const [getHierarchy] = useLazyFileHierarchyQuery();

  const [adataKey, setAdataKey] = useState<string>(
    // new Date().toISOString().split("T")[0]
    ""
  );
  const [numPCs, setNumPCs] = useState<string>("30");
  const [minDist, setMinDist] = useState<string>("0.5");
  const [spread, setSpread] = useState<string>("1.0");
  const [nNeighbors, setNNeighbors] = useState<string>("15");
  
  const [errorKey, setErrorKey] = useState<boolean>(false);
  const [errorPC, setErrorPC] = useState<boolean>(false);
  const [errorDist, setErrorDist] = useState<boolean>(false);
  const [errorSpread, setErrorSpread] = useState<boolean>(false);
  const [errorNeighbors, setErrorNeighbors] = useState<boolean>(false);
  
  const [usedKeys, setUsedKeys] = useState<string[]>([]);
  
  const keyTransform = (key: string) => {
    return `${key
      .replaceAll(" ", "-")
      .replaceAll(".", "-")
      .toLowerCase()}`;
  }
  
  useEffect(() => {
    if (uns) {
      const usedKeys: string[] = Object.keys(uns)
      .filter((e: string) => e.includes("UMAP"))

      setUsedKeys(usedKeys);
    }
  }, [uns]);
  
  return (
    <Dialog
      open={props.isOpen}
      onClose={() => props.setIsOpen(false)}
    >
      <DialogTitle alignSelf="center">
        <DialogTitleHelp
          title="Create Embedding"
          tooltip="This will generate a linear (PCA) and a non-linear (UMAP) dimensional reduction"
        />
      </DialogTitle>

      <DialogContent sx={{ p: 2, width: 300 }}>
        <Stack direction="column" rowGap={4} pt={1}>
          <Stack direction="column" gap={1}>
            <Tooltip
              title="The label is used to reference the embedding"
              placement="top-start"
              enterDelay={1000}
            >
              <TextField
                variant="outlined"
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
                label="Embedding label"
                placeholder="label"
                error={errorKey}
                value={adataKey}
                onChange={(event) => {
                  setErrorKey(false);
                  setAdataKey(event.target.value);
                }}
              />
            </Tooltip>
            <Stack direction="row" gap={1}>
              <Typography
                sx={{
                  opacity: adataKey.length === 0 ? 0 : 100,
                  ml: 1,
                  fontSize: theme.typography.fontSize,
                }}
              >
                label:
              </Typography>
              <Typography
                sx={{
                  opacity: adataKey.length === 0 ? 0 : 100,
                  fontSize: theme.typography.fontSize,
                  fontStyle: "italic",
                }}
              >
                UMAP-{keyTransform(adataKey)}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="column" rowGap={2}>
            <TextField
              variant="outlined"
              size="small"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              label="Principal components"
              error={errorPC}
              value={numPCs}
              onChange={(event) => {
                setErrorPC(false);
                setNumPCs(event.target.value);
              }}
            />
            <TextField
              variant="outlined"
              size="small"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              label="Minimum distance"
              inputProps={{
                step: 0.1,
              }}
              value={minDist}
              onChange={(event) => {
                setErrorDist(false);
                setMinDist(event.target.value);
              }}
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
              error={errorSpread}
              value={spread}
              onChange={(event) => {
                setErrorSpread(false);
                setSpread(event.target.value);
              }}
            />
            <TextField
              variant="outlined"
              size="small"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              label="Neighbors"
              error={errorNeighbors}
              value={nNeighbors}
              onChange={(event) => {
                setErrorNeighbors(false);
                setNNeighbors(event.target.value);
              }}
            />
            <Stack direction="row" width="100%" gap={1}>
              <Button
                fullWidth
                variant="outlined"
                size="medium"
                sx={{
                  fontWeight: "bold",
                }}
                onClick={() => {
                  props.setIsOpen(false);
                }}
              >
                Cancel
              </Button>

              <LoadingButton
                fullWidth
                variant="contained"
                size="medium"
                sx={{
                  fontWeight: "bold",
                  boxShadow: "none",
                }}
                onClick={() => {
                  const isErrorNumPCs = !validateNumber(numPCs, {
                    gt: 0,
                  });
                  const isErrorMinDist = !validateNumber(minDist, {
                    gt: 0,
                    allowFloat: true,
                  });
                  const isErrorSpread = !validateNumber(spread, {
                    gt: 0,
                    allowFloat: true,
                  });
                  const isErrorNNeighbors = !validateNumber(nNeighbors, {
                    gt: 0,
                  });
                  const isErrorKey =
                    adataKey.length === 0 &&
                    !usedKeys.includes(keyTransform(adataKey));

                  setErrorPC(isErrorNumPCs);
                  setErrorDist(isErrorMinDist);
                  setErrorSpread(isErrorSpread);
                  setErrorNeighbors(isErrorNNeighbors);
                  setErrorKey(isErrorKey);

                  if (
                    isErrorNumPCs ||
                    isErrorMinDist ||
                    isErrorSpread ||
                    isErrorNNeighbors ||
                    isErrorKey
                  ) {
                    return;
                  }

                  getNLDR({
                    adataKey: keyTransform(adataKey),
                    numPCs: toNumber(numPCs),
                    minDist: toNumber(minDist, { allowFloat: true }),
                    spread: toNumber(spread, { allowFloat: true }),
                    nNeighbors: toNumber(nNeighbors),
                  }).then((data) => {
                    if (data.data?.ok) {
                      pollTaskStatus(
                        data.data.response,
                        data.data.timestamp,
                        "celeryFileNLDR",
                        dispatch,
                        (result: any) => {
                          dispatch(
                            setAnndataField({
                              attribute: "obsm",
                              field: "data",
                              value: result,
                            })
                          );

                          const newEmbeddingKey = `UMAP-${adataKey}`;

                          if (
                            embeddingKeys &&
                            !embeddingKeys.includes(newEmbeddingKey)
                          ) {
                            dispatch(
                              setAnndataField({
                                attribute: "obsm",
                                field: "keys",
                                value: [
                                  ...embeddingKeys,
                                  "X_pca",
                                  newEmbeddingKey,
                                ],
                              })
                            );
                          }

                          dispatch(
                            setAnndataField({
                              attribute: "obsm",
                              field: "selectedKey",
                              value: newEmbeddingKey,
                            })
                          );
                          
                          getHierarchy();
                        }
                      );
                    }
                  });

                  props.setIsOpen(false);
                }}
              >
                Start
              </LoadingButton>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
