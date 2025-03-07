
import {
  Autocomplete,
  createFilterOptions,
  TextField,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/hooks/hooks";
import { setSelectedGenes } from "../redux/reducers/plotReducer";


export default function GeneAutocomplete() {
  
  const dispatch = useAppDispatch();
  
  const genes = useAppSelector((state) => state.plotReducer.genes);
  const selectedGenes = useAppSelector((state) => state.plotReducer.selectedGenes);
  
  const structuredOptions = genes.map((e, i) => ({ label: e, id: i }));
  const structuredValues = structuredOptions.filter((e) => selectedGenes.includes(e.label));

  const filterOptions = createFilterOptions({ limit: 20 });
  
  return (
    <Autocomplete
      multiple
      disabled={genes.length === 0}
      size="small"
      fullWidth
      value={structuredValues}
      options={structuredOptions}
      onChange={(event: any, value: any, reason, details) => {
        const selectedOption = (details?.option as any)?.label;

        console.log(reason, details)
        
        if (reason === "selectOption") {
          dispatch(setSelectedGenes([...selectedGenes, selectedOption]))
        } else if (reason === "removeOption") {
          dispatch(setSelectedGenes(selectedGenes.filter((e) => e !== selectedOption)))
        } else if (reason === "clear") {
          dispatch(setSelectedGenes([]));
        }
      }}
      filterOptions={filterOptions}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            label="Select gene"
            placeholder="gene name"
            InputLabelProps={{ shrink: true }}
          />
        );
      }}
    />
  );
}