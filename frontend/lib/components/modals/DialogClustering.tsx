import {
  Autocomplete,
  Button,
  createFilterOptions,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { AutocompleteOption } from "@/lib/types";
import { useCeleryFileLeidenMutation } from "@/lib/redux/api/api";
import { pollTaskStatus } from "@/lib/util/handlerPollingTaskStatus";
import { setAnndataField } from "@/lib/redux/reducers/plotReducer";

export default function DialogClustering(props: {
  isOpen: boolean;
  setIsOpen: Function;
}) {

  const uns = useAppSelector((state) => state.plotReducer.anndata.uns.keys) as any;
  const obsp = useAppSelector((state) => state.plotReducer.anndata.obsp.keys);

  const dispatch = useAppDispatch();
  const [getLeiden] = useCeleryFileLeidenMutation()
  
  const [selectedUns, setSelectedUns] = useState<AutocompleteOption | null>(null);
  const [optionsFiltered, setOptionsFiltered] = useState<AutocompleteOption[]>([]);
  const [resolution, setResolution] = useState<number>(1);

  const filterOptions = createFilterOptions({ limit: 20 });
  
  useEffect(() => {
    if (uns && obsp) {
      const structuredOptions: AutocompleteOption[] = Object.keys(uns)
        .filter((e: string) => uns[e] && Object.keys(uns[e]).includes("connectivities_key"))
        .map((e, i) => ({ label: e, id: i }));

      setOptionsFiltered(structuredOptions);
    }
  }, [obsp, uns]);

  return (
    <Dialog open={props.isOpen} onClose={() => props.setIsOpen(false)}>
      <DialogTitle>Create Observation (Leiden)</DialogTitle>
      <DialogContent>
        <Stack direction="column" rowGap={2} pt={2}>
          <Autocomplete
            disabled={optionsFiltered.length === 0}
            size="small"
            fullWidth
            value={selectedUns}
            options={optionsFiltered}
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
            filterOptions={filterOptions}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  label="Select neighborhood graph"
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
              if (selectedUns) {
                
                getLeiden({
                  unsKey: selectedUns?.label,
                  resolution: resolution,
                })
                .then((data) => {
                  
                  if (data.data?.ok) {
                    pollTaskStatus(
                      data.data.response,
                      "celeryFileLeiden",
                      dispatch,
                      () => {
                        const resToString = `${resolution}`.replace(".", "_");
                        const resKey = `leiden_${resToString}_${selectedUns?.label}`;
                        dispatch(
                          setAnndataField({
                            attribute: "obs",
                            field: "selectedKey",
                            value: resKey,
                          })
                        );
                      }
                    )
                  }
                  
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
