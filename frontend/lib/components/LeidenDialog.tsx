import { Autocomplete, Button, createFilterOptions, Dialog, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks/hooks";
import { generate_leiden } from "../fetch/generate_leiden";

export default function LeidenDialog(props: {
  isOpen: boolean;
  setIsOpen: Function
}) {
  
  const dispatch = useAppDispatch();
  const activeFile = useAppSelector((state) => state.fileReducer.activeFile);
  const uns = useAppSelector((state) => state.plotReducer.hierarchy?.uns ?? []);
  
  const [adataKey, setAdataKey] = useState<string>("");
  const [resolution, setResolution] = useState<number>(1);
  const [selectedUns, setSelectedUns] = useState<string[]>([]);
  
  
  const structuredOptions = uns.map((e, i) => ({ label: e, id: i }));
  const structuredSelectedUns = structuredOptions.filter((e) => selectedUns.includes(e.label));
  
  const filterOptions = createFilterOptions({ limit: 20 });
  
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
            value={adataKey}
            onChange={(event) => setAdataKey(event.target.value)}
          />
          <Autocomplete
            multiple
            disabled={uns.length === 0}
            size="small"
            fullWidth
            value={structuredSelectedUns}
            options={structuredOptions}
            onChange={(event: any, value: any, reason, details) => {
              const selectedOption = (details?.option as any)?.label;

              console.log(reason, details);

              if (reason === "selectOption") {
                (setSelectedUns([...selectedUns, selectedOption]));
              } else if (reason === "removeOption") {
                (setSelectedUns(selectedUns.filter((e) => e !== selectedOption)));
              } else if (reason === "clear") {
                (setSelectedUns([]));
              }
            }}
            filterOptions={filterOptions}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  label="Select variable"
                  placeholder="variable"
                  InputLabelProps={{ shrink: true }}
                />
              );
            }}
          />
          <TextField
            variant="outlined"
            size="small"
            type="number"
            inputProps={{
              step: 0.1,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            label="Leiden resolution"
            value={resolution}
            onChange={(event) => setResolution(parseFloat(event.target.value))}
          />
          <Button
            variant="outlined"
            size="medium"
            onClick={() => {
              generate_leiden(activeFile, adataKey, resolution, dispatch);
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