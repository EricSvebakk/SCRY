

import { Autocomplete, Box, Collapse, createFilterOptions, Grid, Link, Stack, TextField, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { theme } from "@/app/layout";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { AutocompleteOption } from "@/lib/types";
import { LoadingButton } from "@mui/lab";
import get_ncbi_gene_summary from "@/lib/fetch/get_ncbi_gene_summary";
import { FeatureScatterPlot } from "../../plots/FeatureScatterPlot";
import { useLazyFileFeatureCoordinatesQuery } from "@/lib/redux/api/api";

export default function PanelGenes(props: {
  open: boolean;
  setOpen: Function;
}) {

  const genes = useAppSelector((state) => state.plotReducer.data.genes);
  const status = useAppSelector((state) => state.plotReducer.statusBackend.fileFeatureCoordinates);
  const report = useAppSelector((state) => state.plotReducer.data.geneReport);
  
  const ref = useRef();
  
  const [selectedGene, setSelectedGene] = useState<AutocompleteOption | null>(null);  
  const [geneOptionsFiltered, setGeneOptionsFiltered] = useState<AutocompleteOption[]>([]);
    
  const unsFilterOptions = createFilterOptions({ limit: 20 });
  
  const dispatch = useAppDispatch();  
  const [getFeatureCoordinates] = useLazyFileFeatureCoordinatesQuery();
  
  useEffect(() => {
    if (genes) {
      const genesStructuredOptions: AutocompleteOption[] = genes.map(
        (e, i) => ({ label: e, id: i })
      );

      setGeneOptionsFiltered(genesStructuredOptions);
    }
  }, [genes]);
  
  return (
    <Collapse
      unmountOnExit
      ref={ref}
      in={props.open}
      orientation="horizontal"
      sx={{
        position: "absolute",
        right: 85,
        top: 0,
        height: "100%",
        zIndex: 500,
      }}
    >
      <Grid
        container
        direction="column"
        height="100%"
        width={300}
        rowGap={1}
        sx={{
          p: 1,
          borderLeft: "1px solid grey",
          backgroundColor: theme.palette.primary.main,
          WebkitBoxShadow: "-1px 0 2px -1px #000000",
          boxShadow: "-1px 0 2px -1px #000000",
        }}
      >
        <Grid item>
          <FeatureScatterPlot />
        </Grid>

        <Grid item>
          <Stack
            direction="column"
            rowGap={1}
            sx={{
              border: "1px solid grey",
              p: 1,
              pt: 2,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Autocomplete
              disabled={genes.length === 0}
              size="small"
              fullWidth
              value={selectedGene}
              options={geneOptionsFiltered}
              isOptionEqualToValue={(option, value) =>
                (option as AutocompleteOption).id ===
                (value as AutocompleteOption).id
              }
              onChange={(event: any, value: any, reason, details) => {
                const selectedOption = details?.option as any;

                if (reason === "selectOption") {
                  setSelectedGene(selectedOption);
                } else if (reason === "removeOption") {
                  setSelectedGene(null);
                } else if (reason === "clear") {
                  setSelectedGene(null);
                }
              }}
              filterOptions={unsFilterOptions}
              noOptionsText="No matching gene"
              renderInput={(params) => {
                return (
                  <TextField
                    {...params}
                    label="Select gene"
                    placeholder="gene"
                    InputLabelProps={{ shrink: true }}
                  />
                );
              }}
            />

            <LoadingButton
              variant="outlined"
              size="medium"
              loading={status.inProgress}
              onClick={() => {
                if (selectedGene) {
                  
                  getFeatureCoordinates({
                    featureKey: selectedGene.label
                  })

                  get_ncbi_gene_summary(selectedGene.label, dispatch);
                }
              }}
            >
              Fetch feature data
            </LoadingButton>
          </Stack>
        </Grid>

        <Grid
          item
          xs
          sx={{
            p: 1,
            height: "100%",
            backgroundColor: theme.palette.background.paper,
            border: "1px solid grey",
          }}
        >
          <Stack
            direction="column"
            sx={{
              height: "100%",
            }}
          >
            <Stack
              direction="row"
              sx={{
                width: "100%",
                justifyContent: "end",
              }}
            >
              <Typography
                variant="caption"
              >
                Gene Summary
              </Typography>
            </Stack>
            
            {report ? (
              <Stack
                direction="column"
                sx={{
                  height: "100%",
                }}
              >
                <Stack
                  direction="column"
                  rowGap={1}
                  sx={{
                    height: "100%",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    {report.symbol}
                  </Typography>

                  <Typography
                    sx={{
                      fontStyle: "italic",
                    }}
                    variant="body2"
                  >
                    {report.description}
                  </Typography>

                  {report.summary.map((e, i) => {
                    return (
                      <Typography key={"report_summary_" + i} variant="body2">
                        {e}
                      </Typography>
                    );
                  })}
                  <Stack direction="column" rowGap={0}>
                    <Typography variant="body2">Synonyms</Typography>
                    <Typography variant="body2">
                      [{report.synonyms.join(", ")}]
                    </Typography>
                  </Stack>
                </Stack>
                
                <Stack
                  direction="row"
                  sx={{
                    width: "100%",
                    justifyContent: "end",
                  }}
                >
                  <Link
                    href={report.source}
                    underline="hover"
                    variant="body2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    [Source]
                  </Link>
                </Stack>
              </Stack>
            ) : (
              <Box
                sx={{
                  height: "100%",
                  width: "100%",
                  alignContent: "center",
                  justifyItems: "center"
                }}
              >
                <Typography variant="body2">
                  No gene selected
                </Typography>
              </Box>
            )}


          </Stack>
        </Grid>

      </Grid>
    </Collapse>
  );
  
}