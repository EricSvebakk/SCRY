import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  Checkbox,
  createFilterOptions,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { AutocompleteOption } from "@/lib/types";
import { useCelltypistAnnotateMutation, useLeidenMutation } from "@/lib/redux/api/api";
import { pollTaskStatus } from "@/lib/util/handlerPollingTaskStatus";
import { setAnndataField } from "@/lib/redux/reducers/plotReducer";
import DialogTitleHelp from "../custom/DialogTitle";
import { toNumber, validateNumber } from "@/lib/util/validateNumber";
import { theme } from "@/lib/design";
import { Help } from "@mui/icons-material";

export default function DialogClustering(props: {
  isOpen: boolean;
  setIsOpen: Function;
}) {
  
  const uns = useAppSelector((state) => state.plotReducer.anndata.uns.keys) as any;
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs);
  const obsp = useAppSelector((state) => state.plotReducer.anndata.obsp.keys);
  const models = useAppSelector((state) => state.plotReducer.data.annotationModels.models);

  const dispatch = useAppDispatch();
  const [getLeiden] = useLeidenMutation();
  const [getAnnotation] = useCelltypistAnnotateMutation();

  const [observationLabel, setObservationLabel] = useState<string>("");
  const [selectedGraph, setSelectedGraph] = useState<AutocompleteOption | null>(null);
  const [optionsFiltered, setOptionsFiltered] = useState<AutocompleteOption[]>([]);
  const [resolution, setResolution] = useState<string>("1.0");
  
  const [useModel, setUseModel] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<AutocompleteOption | null>(null);  
  const [structuredmodels, setStructuredModels] = useState<AutocompleteOption[]>([]);
  const [usedKeys, setUsedKeys] = useState<string[]>([]);

  const [errorLabel, setErrorLabel] = useState<boolean>(false);
  const [errorGraph, setErrorGraph] = useState<boolean>(false);
  const [errorResolution, setErrorResolution] = useState<boolean>(false);
  const [errorModel, setErrorModel] = useState<boolean>(false);

  const filterOptions = createFilterOptions({ limit: 20 });

  useEffect(() => {
    if (uns && obsp) {
      const structuredOptions: AutocompleteOption[] = Object.keys(uns)
        .filter(
          (e: string) =>
            uns[e] && Object.keys(uns[e]).includes("connectivities_key")
        )
        .map((e, i) => ({ label: e, id: i }));

      setOptionsFiltered(structuredOptions);
    }
  }, [obsp, uns]);
  
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
  
  
  
  const resolutionTransform = (res: string): string => {
    return `${res}`.replace(".", "_");
  }

  const keyTransform = (key: string): string => {
    return `${key
      .replaceAll(" ", "-")
      .replaceAll(".", "-")
      .toLowerCase()}`;
  }
  
  const formatObservationLabel = (key: string, res: string) => {
    const keyPrefix = useModel ? "MLM" : `Leiden_${resolutionTransform(res)}`;
    const formattedKey = keyTransform(key)
    return `${keyPrefix}-${formattedKey}`;
  }

  function handleManualAnnotation(key: string, neighborsKey: string, res: number) {
    
    // console.log(key, neighborsKey, res);
    
    // return;
    
    getLeiden({
      unsKey: key,
      neighborsKey: neighborsKey,
      resolution: res,
    })
    .then((data) => {
      if (data.data?.ok) {
        pollTaskStatus(
          data.data.response,
          data.data.timestamp,
          "Leiden",
          dispatch,
          (result: any) => {
            dispatch(
              setAnndataField({
                attribute: "obs",
                field: "indices",
                value: result,
              })
            );

            if (obs.keys && !obs.keys.includes(key)) {
              dispatch(
                setAnndataField({
                  attribute: "obs",
                  field: "keys",
                  value: [...obs.keys, key],
                })
              );
            }

            dispatch(
              setAnndataField({
                attribute: "obs",
                field: "selectedKey",
                value: key,
              })
            );
          }
        );
      }
    });
  }
  
  function handleAutomaticAnnotation(key: string, neighborsKey: string, modelKey: string) {
    
    const connectivitiesKey = uns[neighborsKey].connectivities_key;
    
    console.log(key, connectivitiesKey, modelKey);

    getAnnotation({
      annotationKey: key,
      connectivitiesKey: connectivitiesKey,
      annotationModel: modelKey,
    }).then((data) => {
      if (data.data?.ok) {
        pollTaskStatus(
          data.data.response,
          data.data.timestamp,
          "CelltypistAnnotate",
          dispatch,
          (result: any) => {
            // getHierarchy();

            // if (result.)

            const mvKey = `${key}-majority_voting`;

            dispatch(
              setAnndataField({
                attribute: "obs",
                field: "indices",
                value: result,
              })
            );

            if (obs.keys && !obs.keys.includes(mvKey)) {
              dispatch(
                setAnndataField({
                  attribute: "obs",
                  field: "keys",
                  value: [
                    ...obs.keys,
                    mvKey,
                    `${key}-predicted_labels`,
                    `${key}-over_clustering`,
                  ],
                })
              );
            }

            dispatch(
              setAnndataField({
                attribute: "obs",
                field: "selectedKey",
                value: mvKey,
              })
            );
          }
        );
      }
    });
  }
  
  return (
    <Dialog open={props.isOpen} onClose={() => props.setIsOpen(false)}>
      <DialogTitle>
        <DialogTitleHelp
          title="Create Observation"
          tooltip="This will generate a clustering using the Leiden algorithm based on a UMAP neighborhood graph"
        />
      </DialogTitle>
      <DialogContent sx={{ p: 2, width: 300 }}>
        <Stack direction="column" rowGap={2} pt={2}>
          <Stack direction="column" gap={1}>
            <Tooltip
              title="The label is used to reference the observation"
              placement="top-start"
              enterDelay={1000}
            >
              <TextField
                variant="outlined"
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
                label="Observation label"
                placeholder="label"
                error={errorLabel}
                value={observationLabel}
                onChange={(event) => setObservationLabel(event.target.value)}
              />
            </Tooltip>
            <Stack direction="row" gap={1}>
              <Typography
                sx={{
                  opacity: observationLabel.length === 0 ? 0 : 100,
                  ml: 1,
                  fontSize: theme.typography.fontSize,
                }}
              >
                label:
              </Typography>
              <Typography
                sx={{
                  opacity: observationLabel.length === 0 ? 0 : 100,
                  fontSize: theme.typography.fontSize,
                  fontStyle: "italic",
                }}
              >
                {formatObservationLabel(observationLabel, resolution)}
              </Typography>
            </Stack>
          </Stack>

          <Autocomplete
            disabled={optionsFiltered.length === 0}
            size="small"
            fullWidth
            value={selectedGraph}
            options={optionsFiltered}
            onChange={(event: any, value: any, reason, details) => {
              const selectedOption = details?.option as any;

              setErrorGraph(false);

              if (reason === "selectOption") {
                setSelectedGraph(selectedOption);
              } else if (reason === "removeOption") {
                setSelectedGraph(null);
              } else if (reason === "clear") {
                setSelectedGraph(null);
              }
            }}
            filterOptions={filterOptions}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  error={errorGraph}
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
            error={errorResolution}
            value={resolution}
            onChange={(event) => {
              setErrorResolution(false);
              setResolution(event.target.value);
            }}
          />

          <Accordion
            disableGutters
            elevation={0}
            sx={{
              // mt: 0.5,
              boxShadow: "none",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "4px",
              "&:before": {
                display: "none",
              },
              "&:hover": {
                border: `1px solid grey`,
              },
            }}
          >
            <AccordionSummary
              sx={{
                border: "none",
              }}
            >
              <Typography>Additional options</Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                p: 1,
              }}
            >
              <Stack direction="column" width="100%" gap={2}>
                <Stack
                  component={Button}
                  direction="row"
                  sx={{
                    p: 0,
                    borderRadius: "4px",
                    border: "1px solid grey",
                    borderColor: theme.palette.divider,
                    justifyContent: "start",
                    alignItems: "center",
                  }}
                  onClick={() => setUseModel(!useModel)}
                >
                  <Checkbox size="small" checked={useModel} />
                  <Stack direction="row" gap={1}>
                    <Typography
                      sx={{
                        textTransform: "none",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      Use CellTypist
                    </Typography>
                    <Tooltip
                      title="Use a Machine-Learning Model (MLM) instead of using the Leiden algorithm"
                      placement="right"
                    >
                      <Help fontSize="small" color="action" />
                    </Tooltip>
                  </Stack>
                </Stack>

                <Autocomplete
                  disabled={structuredmodels.length === 0}
                  size="small"
                  fullWidth
                  value={selectedModel}
                  options={structuredmodels}
                  onChange={(event: any, value: any, reason, details) => {
                    const selectedOption = details?.option as any;

                    setErrorModel(false);

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
                        error={errorModel}
                        label="CellTypist model"
                        placeholder="model"
                        InputLabelProps={{ shrink: true }}
                      />
                    );
                  }}
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Stack direction="row" width="100%" gap={1}>
            <Button
              fullWidth
              variant="outlined"
              size="medium"
              sx={{
                fontWeight: "bold",
              }}
              onClick={() => {
                props.setIsOpen(false);
              }}
            >
              Cancel
            </Button>

            <Button
              fullWidth
              variant="contained"
              size="medium"
              sx={{
                fontWeight: "bold",
                boxShadow: "none",
              }}
              onClick={() => {

                const obsLabelKey = formatObservationLabel(observationLabel, resolution);
                
                const isErrorResolution = !validateNumber(resolution, {
                  gt: 0,
                  allowFloat: true,
                });
                const isErrorGraph = selectedGraph === null;
                const isErrorModel = selectedModel === null;
                const isErrorLabel = observationLabel.length === 0 || (obs.keys !== undefined && obs.keys!.includes(obsLabelKey));
                
                setErrorGraph(isErrorGraph);
                setErrorLabel(isErrorLabel);
                setErrorResolution(!useModel && isErrorResolution);
                setErrorModel(useModel && isErrorModel);
                
                if (
                  isErrorGraph ||
                  isErrorLabel ||
                  (!useModel && isErrorResolution) ||
                  (useModel && isErrorModel)
                ) {
                  return;
                }
                
                const neighborsKey = selectedGraph!.label;
                const modelKey = selectedModel!.label;
                const res = toNumber(resolution, { allowFloat: true });

                if (useModel) {
                  handleAutomaticAnnotation(obsLabelKey, neighborsKey!, modelKey);
                } else {
                  handleManualAnnotation(obsLabelKey, neighborsKey!, res);
                }

                props.setIsOpen(false);
              }}
            >
              Start
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

