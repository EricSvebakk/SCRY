

import {
  Autocomplete,
  Box,
  createFilterOptions,
  FilterOptionsState,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type GeneAutocompleteProps = {
  label: string;
  value: string;
  options: string[];
  optionLabels: string[];
  callback: Function;
  error: any;
  isDisabled: boolean;
};

export default function GeneAutocomplete(props: GeneAutocompleteProps) {
  
  const {
    label,
    value,
    options,
    optionLabels,
    callback,
    error,
    isDisabled
  } = props
  
  // const maxSuggestions = options ? Math.min(options.length, 10) : 10;
  // const filterOptions = createFilterOptions();

  return (
    <Autocomplete
      disabled={isDisabled}
      size="small"
      fullWidth
      disablePortal
      value={value}
      options={options}
      onChange={(e, v) => {
        callback(v);
      }}
      renderOption={(props, option) => {
        return (
          <Box {...props} key={props.id} component="li">
            <Stack direction="column" alignItems="start">
              <Typography>
                {option}
              </Typography>
            </Stack>
          </Box>
        );
      }}
      renderInput={(params) => {
        return (
          <TextField {...params} label={label}/>
        )
      }}
    />
  );
}