
import {
  Autocomplete,
  Button,
  createFilterOptions,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { AutocompleteOption } from "@/lib/types";
import { useCeleryFileRGGMutation } from "@/lib/redux/api/api";
import { pollTaskStatus } from "@/lib/util/handlerPollingTaskStatus";
import { setGDEField } from "@/lib/redux/reducers/plotReducer";
import DialogTitleHelp from "../custom/DialogTitle";

export default function DialogDotplot(props: {
  isOpen: boolean;
  setIsOpen: Function;
}) {
  
  const uns = useAppSelector((state) => state.plotReducer.anndata.uns.keys) as any;
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs.keys);
  const genes = useAppSelector((state) => state.plotReducer.data.genes);

  const dispatch = useAppDispatch();
  const [getRGG] = useCeleryFileRGGMutation();
  
  const [selectedUns, setSelectedUns] = useState<AutocompleteOption | null>(null);
  const [selectedGenes, setSelectedGenes] = useState<AutocompleteOption[]>([]);
  const [nGenes, setNGenes] = useState<number>(2);
  
  const [unsOptionsFiltered, setUnsOptionsFiltered] = useState<AutocompleteOption[]>([]);
  const [geneOptionsFiltered, setGeneOptionsFiltered] = useState<AutocompleteOption[]>([]);

  const unsFilterOptions = createFilterOptions({ limit: 20 });

  useEffect(() => {
    if (uns && obs) {
      const unsStructuredOptions: AutocompleteOption[] = obs
        .map((e, i) => ({ label: e, id: i }));
        
      setUnsOptionsFiltered(unsStructuredOptions); 
    }
  }, [obs, uns]);
  
  useEffect(() => {
    if (genes) {
      const genesStructuredOptions: AutocompleteOption[] = genes.map(
        (e, i) => ({ label: e, id: i })
      );

      setGeneOptionsFiltered(genesStructuredOptions);
    }
  }, [genes]);

  return (
    <Dialog open={props.isOpen} onClose={() => props.setIsOpen(false)}>
      <DialogTitle>
        <DialogTitleHelp
          title="Create DGE Ranking"
          tooltip="This will generate a differential gene expression ranking based on the clusters from the selected observation"
        />
        {/* Create DGE Dotplot */}
      </DialogTitle>
      <DialogContent>
        <Stack direction="column" rowGap={2} pt={2} width={300}>
          <Autocomplete
            disabled={unsOptionsFiltered.length === 0}
            size="small"
            fullWidth
            value={selectedUns}
            options={unsOptionsFiltered}
            isOptionEqualToValue={(option, value) =>
              (option as AutocompleteOption).id ===
              (value as AutocompleteOption).id
            }
            onChange={(event: any, value: any, reason, details) => {
              const selectedOption = details?.option as any;

              // console.log(reason, details);

              if (reason === "selectOption") {
                setSelectedUns(selectedOption);
              } else if (reason === "removeOption") {
                setSelectedUns(null);
              } else if (reason === "clear") {
                setSelectedUns(null);
              }
            }}
            filterOptions={unsFilterOptions}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  label="Select observation"
                  placeholder="key"
                  InputLabelProps={{ shrink: true }}
                />
              );
            }}
          />

          <TextField
            variant="outlined"
            size="small"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            label="# of top genes per cluster"
            value={nGenes}
            onChange={(event) => {
              if (!genes) {
                return;
              }

              const newNumGenes = parseFloat(event.target.value);
              if (newNumGenes <= genes.length || newNumGenes >= 0) {
                setNGenes(parseFloat(event.target.value));
              }
            }}
          />

          <Divider sx={{ my: 4 }}></Divider>

          <Autocomplete
            multiple
            disabled={genes.length === 0}
            size="small"
            fullWidth
            value={selectedGenes}
            options={geneOptionsFiltered}
            isOptionEqualToValue={(option, value) =>
              (option as AutocompleteOption).id ===
              (value as AutocompleteOption).id
            }
            onChange={(event: any, value: any, reason, details) => {
              const selectedOption = details?.option as any;

              // console.log(reason, details);

              if (reason === "selectOption") {
                setSelectedGenes([...selectedGenes, selectedOption]);
              } else if (reason === "removeOption") {
                setSelectedGenes(
                  selectedGenes.filter((e) => e !== selectedOption)
                );
              } else if (reason === "clear") {
                setSelectedGenes([]);
              }
            }}
            filterOptions={unsFilterOptions}
            noOptionsText="No matching gene"
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  label="Select additional genes"
                  placeholder="gene"
                  InputLabelProps={{ shrink: true }}
                />
              );
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

            <Button
              fullWidth
              variant="contained"
              size="medium"
              sx={{
                fontWeight: "bold",
                boxShadow: "none",
              }}
              onClick={() => {
                // console.log(selectedUns, selectedGenes);

                if (selectedUns) {
                  getRGG({
                    unsKey: selectedUns.label,
                    nGenes: nGenes,
                    selectedGenes: selectedGenes.map((e) => e.label),
                  }).then((data) => {
                    if (data.data?.ok) {
                      pollTaskStatus(
                        data.data.response,
                        data.data.timestamp,
                        "celeryFileRGG",
                        dispatch,
                        (result: any) => {
                          dispatch(
                            setGDEField({
                              field: "expression",
                              value: result.data.table,
                            })
                          );
                          dispatch(
                            setGDEField({
                              field: "nGenes",
                              value: result.data.n_genes,
                            })
                          );
                          dispatch(
                            setGDEField({
                              field: "nClusters",
                              value: result.data.n_clusters,
                            })
                          );
                          dispatch(
                            setGDEField({
                              field: "dendrogram",
                              value: JSON.parse(result.data.dendro),
                            })
                          );
                        }
                      );
                    }
                  });

                  props.setIsOpen(false);
                }
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
