
import { Autocomplete, Button, createFilterOptions, Dialog, DialogContent, DialogTitle, Divider, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { get_rgg_dotplot } from "@/lib/fetch/get_rgg_dotplot";
import { AutocompleteOption } from "@/lib/types";
import { setDotplotOptions } from "@/lib/redux/reducers/plotReducer";


export default function DotplotDialog(props: {
  isOpen: boolean;
  setIsOpen: Function
}) {
  
  const activeFile = useAppSelector((state) => state.fileReducer.activeFile);
  const uns = useAppSelector((state) => state.plotReducer.hierarchy?.uns);
  const obs = useAppSelector((state) => state.plotReducer.hierarchy?.obs);
  const genes = useAppSelector((state) => state.plotReducer.genes);
  const dpOptions = useAppSelector((state) => state.plotReducer.dotplotOptions);
 
  const dispatch = useAppDispatch();
  const [selectedUns, setSelectedUns] = useState<AutocompleteOption | null>(null);
  const [optionsFiltered, setOptionsFiltered] = useState<AutocompleteOption[]>([]);
  const [nGenes, setNGenes] = useState<number>(2);

  const filterOptions = createFilterOptions({ limit: 20 });
  
  useEffect(() => {
    if (uns && obs) {      
      const unsKeys = Object.keys(uns);
      
      const structuredOptions: AutocompleteOption[] = unsKeys
        .filter((e) => obs.includes(uns[e]?.params?.groupby))
        .map((e, i) => ({ label: uns[e].params.groupby, id: i }));
      
      setOptionsFiltered(structuredOptions);
      console.log(structuredOptions)
    }
  }, [obs, uns]);
  
  
  return (
    <Dialog open={props.isOpen} onClose={() => props.setIsOpen(false)}>
      <DialogTitle>Please provide an attribute key</DialogTitle>
      <DialogContent>
        <Stack direction="column" rowGap={2} pt={2}>
          
          <Autocomplete
            disabled={optionsFiltered.length === 0}
            size="small"
            fullWidth
            value={selectedUns}
            options={optionsFiltered}
            isOptionEqualToValue={(option, value) => {
              return (option as AutocompleteOption).id === (value as AutocompleteOption).id
            }}
            onChange={(event: any, value: any, reason, details) => {
              const selectedOption = (details?.option as any)

              console.log(reason, details);

              if (reason === "selectOption") {
                setSelectedUns(selectedOption)
              } else if (reason === "removeOption") {
                setSelectedUns(null);
              } else if (reason === "clear") {
                setSelectedUns(null);
              }
            }}
            filterOptions={filterOptions}
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
          
          <Divider></Divider>
          
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
              if ((newNumGenes <= genes.length) || (newNumGenes >= 0)) {
                setNGenes(parseFloat(event.target.value))
              }
            }}
          />
          <Button
            variant="outlined"
            size="medium"
            onClick={() => {
              console.log(selectedUns)
              if (selectedUns) {
                dispatch(setDotplotOptions({
                  ...dpOptions,
                  title: selectedUns.label
                }));
                get_rgg_dotplot(activeFile, selectedUns.label, nGenes, dispatch);
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