

import { Autocomplete, Collapse, createFilterOptions, Stack, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { theme } from "@/lib/design";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { AutocompleteOption } from "@/lib/types";
import { LoadingButton } from "@mui/lab";
import fetchSummaryNCBI from "@/lib/util/fetchSummaryNCBI";
import { FeatureScatterPlot } from "../../plots/FeatureScatterPlot";
import { useLazyFileFeatureCoordinatesQuery } from "@/lib/redux/api/api";
import GeneSummary from "../../custom/GeneSummary";

export default function PanelGenes(props: {
  open: boolean;
  setOpen: Function;
}) {

  const uns = useAppSelector((state) => state.plotReducer.anndata.uns.keys) as any;  
  const genes = useAppSelector((state) => state.plotReducer.data.genes);
  const status = useAppSelector((state) => state.plotReducer.statusBackend.fileFeatureCoordinates);
  const report = useAppSelector((state) => state.plotReducer.data.geneReport);
  
  const ref = useRef();
  
  const [tableData, setTableData] = useState<string[]>([]);  
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
  
   useEffect(() => {
     if (uns) {
       const newTableData = Object.keys(uns).filter((e: string) =>
         uns[e] && Object.keys(uns[e]).includes("n_genes")
       );

       setTableData(newTableData);
     }
   }, [uns]);
  
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
      <Stack
        direction="column"
        // height="100%"
        width={300}
        rowGap={1}
        sx={{
          p: 1,
          height: "100vh",
          overflow: "hidden",
          borderLeft: "1px solid grey",
          backgroundColor: theme.palette.primary.main,
          WebkitBoxShadow: "-1px 0 2px -1px #000000",
          boxShadow: "-1px 0 2px -1px #000000",
        }}
      >
        <FeatureScatterPlot />

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
                  featureKey: selectedGene.label,
                });

                fetchSummaryNCBI(selectedGene.label, dispatch);
              }
            }}
          >
            Fetch feature data
          </LoadingButton>

          {/* <Autocomplete
            disabled={genes.length === 0}
            size="small"
            sx={{
              pt: 1
            }}
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
                  label="Select DGE result"
                  placeholder="DGE"
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
                  featureKey: selectedGene.label,
                });

                get_ncbi_gene_summary(selectedGene.label, dispatch);
              }
            }}
          >
            Fetch expression dotplot
          </LoadingButton> */}
        </Stack>

        {/* <Stack
          direction="column"
          rowGap={1}
          sx={{
            border: "1px solid grey",
            p: 1,
            pt: 2,
            backgroundColor: theme.palette.background.paper,
          }}
        >
        </Stack> */}

        <Stack
          direction="column"
          rowGap={1}
          sx={{
            height: "30vh",
            // height: "60vh",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <GeneSummary />

          {/* <MiniatureDotPlot /> */}
        </Stack>
      </Stack>
    </Collapse>
  );
  
}