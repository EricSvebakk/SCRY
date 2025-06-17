
import { Autocomplete, Button, createFilterOptions, Dialog, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { generate_ranked_genes_groups } from "@/lib/fetch/generate_ranked_genes_groups";
import { AutocompleteOption } from "@/lib/types";

type option = {
  label: string;
  id: number;
}

export default function RGGDialog(props: {
  isOpen: boolean;
  setIsOpen: Function
}) {
  
  const activeFile = useAppSelector((state) => state.fileReducer.activeFile);
  const uns = useAppSelector((state) => state.plotReducer.hierarchy?.uns);
  const obs = useAppSelector((state) => state.plotReducer.hierarchy?.obs);
  
  const dispatch = useAppDispatch();
  const [selectedUns, setSelectedUns] = useState<option | null>(null);
  const [optionsFiltered, setOptionsFiltered] = useState<AutocompleteOption[]>([]);
  
  const filterOptions = createFilterOptions({ limit: 20 });

  useEffect(() => {
    if (uns && obs) {      
      const structuredOptions: AutocompleteOption[] = Object.keys(uns)
        .filter((e) => obs.includes(e))
        .map((e, i) => ({ label: e, id: i }));
      
      setOptionsFiltered(structuredOptions);
    }
  }, [obs, uns]);
  
  return (
    <Dialog open={props.isOpen} onClose={() => props.setIsOpen(false)}>
      <DialogTitle>RGG</DialogTitle>
      <DialogContent>
        <Stack direction="column" rowGap={2} pt={2} width={300}>
          <Autocomplete
            disabled={optionsFiltered.length === 0}
            size="small"
            fullWidth
            value={selectedUns}
            options={optionsFiltered}
            isOptionEqualToValue={(option, value) => {
              return (option as option).id === (value as option).id
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
          <Button
            variant="outlined"
            size="medium"
            onClick={() => {
              console.log(selectedUns)
              if (selectedUns) {
                generate_ranked_genes_groups(activeFile, selectedUns?.label, dispatch);
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