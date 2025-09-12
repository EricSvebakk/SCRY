import { get_celltypist_annotations } from "@/lib/fetch/workflow/get_celltypist_annotations";
import { useCeleryCelltypistAnnotateMutation, useFileHierarchyQuery, useLazyFileHierarchyQuery } from "@/lib/redux/api/api";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { setAnndataField, setFieldAcrossAnndata } from "@/lib/redux/reducers/plotReducer";
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
  
  const [getAnnotation] = useCeleryCelltypistAnnotateMutation();
  const [getHierarchy] = useLazyFileHierarchyQuery();
  // const [getObs] = useLazyFileHierarchyQuery();
  
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
                
                const connectivitiesKey = uns[selectedConnectivity?.label].connectivities_key;
                
                getAnnotation({
                    fileID: activeFile,
                    annotationKey: annotationKey,
                    connectivitiesKey: connectivitiesKey,
                    annotationModel: selectedModel.label,
                })
                .then((data) => {
                  
                  const conKey = `${connectivitiesKey}_MAJORITY_VOTING`
                  
                  dispatch(
                    setAnndataField({
                      attribute: "obs",
                      field: "selectedKey",
                      value: conKey,
                    })
                  );
                  
                  // dispatch(incrementRefreshCounter("hierarchy"));
                  // 
                  // getHierarchy({
                  //   fileID: activeFile
                  // })
                  // .then((data) => {
                  //   dispatch(
                  //     setFieldAcrossAnndata({
                  //       field: "keys",
                  //       values: data,
                  //     })
                  //   );
                  // })
                  
                  // get_file_obs(fileID, conKey, dispatch);
                  // get_file_hierarchy(fileID, dispatch);
                  
                })
                
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