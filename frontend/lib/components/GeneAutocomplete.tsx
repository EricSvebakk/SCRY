

import {
  Autocomplete,
  createFilterOptions,
  TextField,
} from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";

type GeneAutocompleteProps = {
  values: string[];
  options: string[];
  callback: Dispatch<SetStateAction<string[]>>;
  error: any;
  isDisabled: boolean;
};

export default function GeneAutocomplete(props: GeneAutocompleteProps) {
  
  const {
    values,
    options,
    callback,
    error,
    isDisabled
  } = props
  
  const structuredOptions = options.map((e, i) => ({ label: e, id: i }))
  const structuredValues = structuredOptions.filter((e) => values.includes(e.label));

  const filterOptions = createFilterOptions({
    limit: 20,
    
  });
  
  return (
    <Autocomplete
      multiple
      disabled={isDisabled}
      size="small"
      fullWidth
      value={structuredValues}
      options={structuredOptions}
      onChange={(event: any, value: any, reason, details) => {
        const selectedOption = (details?.option as any).label;

        if (reason === "selectOption") {
          callback((f: any) => [...f, selectedOption]);
        } else if (reason === "removeOption") {
          callback((f: any[]) => f.filter((e) => e !== selectedOption));
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