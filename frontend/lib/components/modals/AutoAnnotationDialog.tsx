import { get_celltypist_annotations } from "@/lib/fetch/workflow/get_celltypist_annotations";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { AutocompleteOption } from "@/lib/types";
import { Autocomplete, Button, createFilterOptions, Dialog, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";

export default function AutoAnnotationDialog(props: {
  isOpen: boolean;
  setIsOpen: Function;
}) {
  
  const activeFile = useAppSelector((state) => state.fileReducer.activeFile);
  const models = useAppSelector((state) => state.plotReducer.data.annotationModels.models);
  const uns = useAppSelector((state) => state.plotReducer.anndata.uns.keys) as any;
  const obsp = useAppSelector((state) => state.plotReducer.anndata.obsp.keys);
  
  const dispatch = useAppDispatch();
  
  const [selectedModel, setSelectedModel] = useState<AutocompleteOption | null>(null);
  const [structuredmodels, setStructuredModels] = useState<AutocompleteOption[]>([]);
  
  const [connectivitiesFilteredOptions, setConnectivitiesFilteredOptions] = useState<AutocompleteOption[]>([]);
  const [selectedConnectivity, setSelectedConnectivity] = useState<AutocompleteOption | null>(null);
  
  const [annotationKey, setAnnotationKey] = useState<string>("");
  
  const filterOptions = createFilterOptions({ limit: 20 });
  
  useEffect(() => {
    if (models.length > 0) {
      const structuredOptions: AutocompleteOption[] = models.map((e, i) => ({ label: e.model, id: i }))
      setStructuredModels(structuredOptions);
      const defaultOption = structuredOptions.find((e) => e.label == "Immune_All_Low.pkl");
      if (defaultOption) {
        setSelectedModel(defaultOption);
      }
    }
  }, [models]);
  
    useEffect(() => {
    if (uns && obsp) {
      const structuredOptions: AutocompleteOption[] = Object.keys(uns)
        .filter((e: string) => uns[e] && Object.keys(uns[e]).includes("connectivities_key"))
        .map((e, i) => ({ label: e, id: i }));

      setConnectivitiesFilteredOptions(structuredOptions);
    }
  }, [obsp, uns]);
  
  return (
    <Dialog open={props.isOpen} onClose={() => props.setIsOpen(false)}>
      <DialogTitle>Automatic Annotation Suggestion</DialogTitle>
      <DialogContent>
        <Stack direction="column" rowGap={2} pt={2}>

          <Autocomplete
            disabled={connectivitiesFilteredOptions.length === 0}
            size="small"
            fullWidth
            value={selectedConnectivity}
            options={connectivitiesFilteredOptions}
            onChange={(event: any, value: any, reason, details) => {
              const selectedOption = details?.option as any;

              console.log(reason, details);

              if (reason === "selectOption") {
                setSelectedConnectivity(selectedOption);
              } else if (reason === "removeOption") {
                setSelectedConnectivity(null);
              } else if (reason === "clear") {
                setSelectedConnectivity(null);
              }
            }}
            filterOptions={filterOptions}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  label="Select connectivities"
                  placeholder="key"
                  InputLabelProps={{ shrink: true }}
                />
              );
            }}
          />

          <Autocomplete
            disabled={structuredmodels.length === 0}
            size="small"
            fullWidth
            value={selectedModel}
            options={structuredmodels}
            onChange={(event: any, value: any, reason, details) => {
              const selectedOption = details?.option as any;

              console.log(reason, details);

              if (reason === "selectOption") {
                setSelectedModel(selectedOption);
              } else if (reason === "removeOption") {
                setSelectedModel(null);
              } else if (reason === "clear") {
                setSelectedModel(null);
              }
            }}
            filterOptions={filterOptions}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  label="Select model"
                  placeholder="model"
                  InputLabelProps={{ shrink: true }}
                />
              );
            }}
          />

          <TextField
            variant="outlined"
            size="small"
            type="text"
            InputLabelProps={{
              shrink: true,
            }}
            label="Annotation key"
            value={annotationKey}
            onChange={(event) => setAnnotationKey(event.target.value)}
          />

          <Button
            variant="outlined"
            size="medium"
            onClick={() => {
              
              if (selectedConnectivity?.label && selectedModel?.label) {

                get_celltypist_annotations(
                  activeFile,
                  annotationKey,
                  uns[selectedConnectivity?.label].connectivities_key,
                  selectedModel.label,
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