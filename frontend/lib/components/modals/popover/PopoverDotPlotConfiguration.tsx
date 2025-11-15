import { theme } from "@/lib/design";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { setPlotConfigField } from "@/lib/redux/reducers/plotReducer";
import {
  AutocompleteOption,
  colorTypes as layerType,
  highlightType,
  sortClustersByType,
  sortGenesByType,
} from "@/lib/types";
import { Close, Settings } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  createFilterOptions,
  Grid,
  IconButton,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { MouseEvent, useEffect, useState } from "react";

const layerOptions = [
  {
    label: "Average",
    value: "mean_expr" as layerType,
  },
  {
    label: "Logfold",
    value: "logfoldchange" as layerType,
  },
  {
    label: "P-value",
    value: "pvals_adj" as layerType,
  },
] as AutocompleteOption[];

const highlightOptions = [
  {
    label: "#1 Rank",
    value: "rgg_order" as highlightType,
  },
  {
    label: "Most expressed gene per cluster",
    value: "cluster" as highlightType,
  },
  {
    label: "Most expressed cluster per gene",
    value: "gene" as highlightType,
  },
  {
    label: "None",
    value: "none" as highlightType,
  },
] as AutocompleteOption[];

const sortClustersByOptions = [
  {
    label: "Dendrogram order",
    value: "dendrogram" as sortClustersByType,
  },
  {
    label: "Alphabetical order",
    value: "alphabetical" as sortClustersByType,
  },
] as AutocompleteOption[];

const sortGenesByOptions = [
  {
    label: "Rank order",
    value: "rgg_order" as sortGenesByType,
  },
  {
    label: "Average expression",
    value: "mean" as sortGenesByType,
  },
  {
    label: "Fraction expression",
    value: "fraction" as sortGenesByType,
  },
  {
    label: "Alphabetical order",
    value: "alphabetical" as sortGenesByType,
  },
] as AutocompleteOption[];

export function DotPlotConfigurationPopover() {
  const expression = useAppSelector(
    (state) => state.plotReducer.data.GDE.expression
  );
  const genes = useAppSelector((state) => state.plotReducer.data.genes);
  const config = useAppSelector((state) => state.plotReducer.plot.expression);

  const dispatch = useAppDispatch();

  const [exprMin, setExprMin] = useState(
    config.expressionMinDefault.toFixed(2)
  );
  const [exprMax, setExprMax] = useState(
    config.expressionMaxDefault.toFixed(2)
  );
  const [selectedLayer, setSelectedLayer] = useState<AutocompleteOption>(
    layerOptions[0]
  );
  const [selectedHighlight, setSelectedHighlight] =
    useState<AutocompleteOption>(highlightOptions[0]);
  const [selectedClusterSorting, setSelectedClusterSorting] =
    useState<AutocompleteOption>(sortClustersByOptions[0]);
  const [selectedGeneSorting, setSelectedGeneSorting] =
    useState<AutocompleteOption>(sortGenesByOptions[0]);
  const [selectedGenes, setSelectedGenes] = useState<AutocompleteOption[]>([]);
  const [currentGenes, setCurrentGenes] = useState<AutocompleteOption[]>([]);

  const [geneOptionsFiltered, setGeneOptionsFiltered] = useState<
    AutocompleteOption[]
  >([]);

  const [exprMinError, setExprMinError] = useState(false);
  const [exprMaxError, setExprMaxError] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleConfirm = (isDefault: boolean = false) => {
    const parsedExprMin = parseFloat(exprMin);
    const parsedExprMax = parseFloat(exprMax);

    const isMinNaN = Number.isNaN(parsedExprMin);
    const isMaxNaN = Number.isNaN(parsedExprMax);

    setExprMinError(isMinNaN);
    setExprMaxError(isMaxNaN);

    if (isMinNaN || isMaxNaN) {
      return;
    }

    const expressionIsDefault =
      isDefault ||
      config.layer !== selectedLayer.value! ||
      (parsedExprMin === config.expressionMinDefault &&
        parsedExprMax === config.expressionMaxDefault);

    setCurrentGenes(selectedGenes);

    dispatch(
      setPlotConfigField({
        plot: "expression",
        config: {
          ...config,
          expressionMin: parsedExprMin
            ? parsedExprMin
            : config.expressionMinDefault,
          expressionMax: parsedExprMax
            ? parsedExprMax
            : config.expressionMaxDefault,
          layer: selectedLayer.value! as layerType,
          highlight: selectedHighlight.value! as highlightType,
          sortClustersBy: selectedClusterSorting.value! as sortClustersByType,
          sortGenesBy: selectedGeneSorting.value! as sortGenesByType,
          selected: selectedGenes.map((e) => e.label),
          expressionIsDefault: expressionIsDefault,
        },
      })
    );
  };

  const handleCancel = () => {
    // handleClose();
    setExprMin(config.expressionMinDefault.toFixed(2));
    setExprMax(config.expressionMaxDefault.toFixed(2));
    setSelectedLayer(layerOptions.find((e) => e.value === config.layer)!);
    setSelectedHighlight(
      highlightOptions.find((e) => e.value === config.highlight)!
    );
    setSelectedClusterSorting(
      sortClustersByOptions.find((e) => e.value === config.sortClustersBy)!
    );
    setSelectedGeneSorting(
      sortGenesByOptions.find((e) => e.value === config.sortGenesBy)!
    );
    setSelectedGenes(currentGenes);
  };

  // const handleReset = () => {
  //   setExprMin(config.expressionMinDefault.toFixed(2));
  //   setExprMax(config.expressionMaxDefault.toFixed(2));
  //   setSelectedLayer(layerOptions[0]);
  //   setSelectedHighlight(highlightOptions[0]);
  //   setSelectedClusterSorting(sortClustersByOptions[0]);
  //   setSelectedGeneSorting(sortGenesByOptions[0]);
  //   setSelectedGenes([]);
  //   handleConfirm(true);
  //   // handleClose();
  // };

  const unsFilterOptions = createFilterOptions({ limit: 20 });

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover-dotplotconfig" : undefined;

  // Resets expression range states
  useEffect(() => {
    if (config.expressionIsDefault) {
      setExprMin(config.expressionMinDefault.toFixed(2));
      setExprMax(config.expressionMaxDefault.toFixed(2));
    }
  }, [
    config.layer,
    config.expressionIsDefault,
    config.expressionMinDefault,
    config.expressionMaxDefault,
  ]);

  useEffect(() => {
    if (genes) {
      const genesStructuredOptions: AutocompleteOption[] = genes.map(
        (e, i) => ({ label: e, id: i })
      );

      setGeneOptionsFiltered(genesStructuredOptions);
    }
  }, [genes]);

  return (
    <>
      <Tooltip
        enterDelay={0}
        placement="bottom"
        title="Open settings for dotplot"
        disableFocusListener={!expression || expression.length == 0}
      >
        <IconButton
          size="small"
          disabled={!expression || expression.length == 0}
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            setAnchorEl(event.currentTarget);
          }}
          aria-describedby={id}
          sx={{
            p: 0,
            minHeight: 0,
            minWidth: 0,
          }}
        >
          <Settings />
        </IconButton>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Stack
          direction="column"
          width={300}
          height="fit-content"
          p={1}
          gap={1}
        >
          <Stack direction="row" justifyContent="end" width="100%">
            <IconButton size="small" onClick={() => handleClose()}>
              <Close />
            </IconButton>
          </Stack>

          <Grid width="100%" container direction="row" gap={1}>
            <Grid item xs>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                inputProps={{
                  step: "0.1",
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                label="Min. expression"
                value={exprMin}
                error={exprMinError}
                onChange={(event) => {
                  setExprMin(event.target.value);
                }}
              />
            </Grid>
            <Grid item xs>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                inputProps={{
                  step: "0.1",
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                label="Max. expression"
                value={exprMax}
                error={exprMaxError}
                onChange={(event) => {
                  setExprMax(event.target.value);
                }}
              />
            </Grid>
          </Grid>

          <ConfigurationOption
            label="Data layer"
            options={layerOptions}
            currentOption={config.layer}
            selectedOption={selectedLayer}
            setSelectedOption={setSelectedLayer}
          />

          <Autocomplete
            sx={{ pt: 1 }}
            multiple
            disabled={genes.length === 0}
            size="small"
            fullWidth
            value={selectedGenes}
            options={geneOptionsFiltered}
            isOptionEqualToValue={(option, value) =>
              (option as AutocompleteOption).id ===
              (value as AutocompleteOption).id
            }
            onChange={(event: any, value: any, reason, details) => {
              const selectedOption = details?.option as any;

              // console.log(reason, details);

              if (reason === "selectOption") {
                setSelectedGenes([...selectedGenes, selectedOption]);
              } else if (reason === "removeOption") {
                setSelectedGenes(
                  selectedGenes.filter((e) => e !== selectedOption)
                );
              } else if (reason === "clear") {
                setSelectedGenes([]);
              }
            }}
            filterOptions={unsFilterOptions}
            noOptionsText="No matching gene"
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  label="Select additional genes"
                  placeholder="gene"
                  InputLabelProps={{ shrink: true }}
                />
              );
            }}
          />

          <Accordion
            disableGutters
            elevation={0}
            sx={{
              mt: 0.5,
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
              <Stack direction="column" width="100%" gap={1}>
                <ConfigurationOption
                  label="Sort clusters by"
                  options={sortClustersByOptions}
                  currentOption={config.sortClustersBy}
                  selectedOption={selectedClusterSorting}
                  setSelectedOption={setSelectedClusterSorting}
                />

                <ConfigurationOption
                  label="Sort genes by"
                  options={sortGenesByOptions}
                  currentOption={config.sortGenesBy}
                  selectedOption={selectedGeneSorting}
                  setSelectedOption={setSelectedGeneSorting}
                />

                <ConfigurationOption
                  label="Highlight"
                  options={highlightOptions}
                  currentOption={config.highlight}
                  selectedOption={selectedHighlight}
                  setSelectedOption={setSelectedHighlight}
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Grid width="100%" container direction="row" gap={1} pt={1}>
            <Grid item xs>
              <Tooltip
                placement="bottom"
                enterDelay={1000}
                title="Revert changes to current dot plot configuration"
              >
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    height: "100%",
                  }}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Tooltip>
            </Grid>
            {/* <Grid item xs>
              <Tooltip
                placement="bottom"
                enterDelay={1000}
                title="Reset settings to default dot plot configuration"
              >
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    height: "100%",
                  }}
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Tooltip>
            </Grid> */}
            <Grid item xs>
              <Tooltip
                placement="bottom"
                enterDelay={1000}
                title="Confirm changes to dot plot configuration"
              >
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    color: theme.palette.text.secondary,
                    height: "100%",
                  }}
                  onClick={() => handleConfirm()}
                >
                  Confirm
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        </Stack>
      </Popover>
    </>
  );
}

function ConfigurationOption(props: {
  label: string;
  currentOption: string | null;
  options: AutocompleteOption[];
  selectedOption: AutocompleteOption;
  setSelectedOption: Function;
}) {
  const currentAutocompleteOption: AutocompleteOption | undefined =
    props.options.find((e) => e.value == props.currentOption);

  return (
    <Autocomplete
      sx={{ pt: 1 }}
      size="small"
      fullWidth
      value={props.selectedOption}
      options={props.options}
      onChange={(event: any, value: any, reason, details) => {
        const selectedOption = details?.option as any;

        // console.log(reason, details);

        if (reason === "selectOption") {
          props.setSelectedOption(selectedOption);
        } else if (reason === "removeOption") {
          props.setSelectedOption(currentAutocompleteOption);
        } else if (reason === "clear") {
          props.setSelectedOption(currentAutocompleteOption);
        }
      }}
      isOptionEqualToValue={(option, value) => {
        const tempOption = option as AutocompleteOption;
        const tempValue = value as AutocompleteOption;

        return tempOption.value
          ? tempOption.value === tempValue.value
          : tempOption.label === tempValue.label;
      }}
      getOptionDisabled={(option) =>
        props.selectedOption.value === (option as AutocompleteOption).value
      }
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            label={`${props.label}${
              props.selectedOption.value !== props.currentOption ? "*" : ""
            }`}
            placeholder="key"
            InputLabelProps={{ shrink: true }}
          />
        );
      }}
    />
  );
}
