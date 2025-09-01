
import { Autocomplete, Box, Button, Collapse, createFilterOptions, Grid, Link, Stack, SxProps, TextField, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { theme } from "@/app/layout";
import { GroupWork } from "@mui/icons-material";
import { FeatureScatterPlot } from "../plots/FeatureScatterPlot";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { AutocompleteOption } from "@/lib/types";
import { get_feature_coordinates } from "@/lib/fetch/get_feature_coordinates";
import { LoadingButton } from "@mui/lab";
import get_ncbi_gene_summary from "@/lib/fetch/get_ncbi_gene_summary";


export default function NavbarRight() {
  
  const fileID = useAppSelector((state) => state.fileReducer.activeFile);  
  const genes = useAppSelector((state) => state.plotReducer.data.genes);
  const status = useAppSelector((state) => state.plotReducer.status.get_feature_coordinates);
  const report = useAppSelector((state) => state.plotReducer.data.geneReport);
  
  const ref = useRef();
  const dispatch = useAppDispatch();  

  const [open, setOpen] = useState(false);
  const [selectedGene, setSelectedGene] = useState<AutocompleteOption | null>(null);  
  const [geneOptionsFiltered, setGeneOptionsFiltered] = useState<AutocompleteOption[]>([]);
    
  const unsFilterOptions = createFilterOptions({ limit: 20 });
  
  
  const navItemProps = (isOpen: boolean, index: number | null = null) => {
    return {
      color: theme.palette.text.secondary,
      backgroundColor: isOpen
        ? theme.palette.primary.main
        : theme.palette.secondary.main,
      height: "100%",
      fontWeight: "bold",
      borderRadius: "0",
      "&:hover": {
        backgroundColor: "#aaa",
      },
      borderTop: isOpen && index && index !== 0 ? "1px solid grey" : "none",
      borderBottom: isOpen ? "1px solid grey" : "none",
      borderLeft: isOpen ? "none" : "1px solid grey",
    } as SxProps;
  };
  
  
    useEffect(() => {
      if (genes) {
        const genesStructuredOptions: AutocompleteOption[] = genes.map(
          (e, i) => ({ label: e, id: i })
        );
  
        setGeneOptionsFiltered(genesStructuredOptions);
      }
    }, [genes]);
  
  return (
    <Box height="100%">
      <Collapse
        unmountOnExit
        ref={ref}
        in={open}
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
                    get_feature_coordinates(
                      fileID as string,
                      selectedGene.label,
                      dispatch
                    );

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

      <Grid
        item
        container
        direction="column"
        height="100%"
        overflow="clip"
        sx={{
          zIndex: 1200,
        }}
      >
        <Grid item height={70}>
          <Button
            fullWidth
            sx={navItemProps(open)}
            onClick={() => {
              setOpen(!open);
            }}
          >
            <Stack
              direction="column"
              sx={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {<GroupWork />}
              <Typography fontSize={theme.typography.subtitle1.fontSize}>
                Gene view
              </Typography>
            </Stack>
          </Button>
        </Grid>

        <Grid
          item
          xs
          sx={{
            height: "100%",
            width: "100%",
            borderLeft: "1px solid grey",
            backgroundColor: theme.palette.secondary.main,
          }}
        />
      </Grid>
    </Box>
  );
  
}