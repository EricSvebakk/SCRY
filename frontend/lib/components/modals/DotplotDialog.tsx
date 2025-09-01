
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
import { get_rgg_dotplot } from "@/lib/fetch/workflow/get_rgg_dotplot";
import { AutocompleteOption } from "@/lib/types";

export default function DotplotDialog(props: {
  isOpen: boolean;
  setIsOpen: Function;
}) {
  
  const activeFile = useAppSelector((state) => state.fileReducer.activeFile);
  const uns = useAppSelector((state) => state.plotReducer.anndata.uns.keys) as any;
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs.keys);
  const genes = useAppSelector((state) => state.plotReducer.data.genes);

  const dispatch = useAppDispatch();
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
      <DialogTitle>Dot plot</DialogTitle>
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

              console.log(reason, details);

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
                  label="Select key"
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
              const selectedOption = (details?.option as any);

              console.log(reason, details);

              if (reason === "selectOption") {
                setSelectedGenes([...selectedGenes, selectedOption]);
              } else if (reason === "removeOption") {
                setSelectedGenes(selectedGenes.filter((e) => e !== selectedOption))
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

          <Button
            variant="outlined"
            size="medium"
            onClick={() => {
              console.log(selectedUns, selectedGenes);
              
              if (selectedUns) {

                get_rgg_dotplot(
                  activeFile,
                  selectedUns.label,
                  nGenes,
                  selectedGenes.map((e) => e.label),
                  dispatch
                );
                props.setIsOpen(false);
              }
            }}
          >
            Start
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
