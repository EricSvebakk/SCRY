"use client";

import {
  Box,
  Button,
  ButtonGroup,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import { MouseEventHandler, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { setCurrentTab } from "@/lib/redux/reducers/plotReducer";
import { ScatterPlot } from "@/lib/components/ScatterPlot";
import { setActiveFile } from "@/lib/redux/reducers/fileReducer";
import { get_file_hierarchy } from "@/lib/fetch/get_file_hierarchy";
import { ImageSavingPopover } from "@/lib/components/modals/ImageSavingPopover";
import { DotPlot } from "@/lib/components/DotPlot";
import { ListLabelOptions } from "@/lib/components/controls/ListLabelOptions";
import { DotPlotConfigurationPopover } from "@/lib/components/modals/DotPlotConfigurationPopover";
import { get_genes } from "@/lib/fetch/get_genes";
import LoadingButton from "@mui/lab/LoadingButton";
import ListLabels from "@/lib/components/controls/ListLabels";
import NLDRDialog from "@/lib/components/modals/NLDRDialog";
import ClusteringDialog from "@/lib/components/modals/ClusteringDialog";
import DotplotDialog from "@/lib/components/modals/DotplotDialog";
import ListEmbeddings from "@/lib/components/controls/ListEmbeddings";
import LDRDialog from "@/lib/components/modals/LDRDialog";

type step = {
  label: string;
  id: string;
  // disabled: boolean;
  loading: boolean;
  function: MouseEventHandler | undefined;
};

export default function FileIdPage({}) {
  const { fileID } = useParams();

  const status = useAppSelector((state) => state.plotReducer.status);
  const currentTab = useAppSelector((state) => state.plotReducer.navigation.currentTab);

  const dispatch = useAppDispatch();

  const [isLDRDialogOpen, setIsLDRDialogOpen] = useState(false);
  const [isNLDRDialogOpen, setIsNLDRDialogOpen] = useState(false);
  const [isClusteringDialogOpen, setIsClusteringDialogOpen] = useState(false);
  const [isDotplotDialogOpen, setIsDotplotDialogOpen] = useState(false);

  const steps: step[] = [
    {
      label: "Linear Dimension Reduction",
      id: "ldr",
      function: () => setIsLDRDialogOpen(true),
      loading: false,
    },
    {
      label: "Non-linear Dimension Reduction",
      id: "nldr",
      function: () => setIsNLDRDialogOpen(true),
      loading: status.generate_umap.inProgress,
    },
    {
      label: "Clustering of cells",
      id: "cc",
      function: () => setIsClusteringDialogOpen(true),
      loading: status.generate_leiden.inProgress,
    },
    {
      label: "Differential Expression Dotplot",
      id: "ded",
      function: () => setIsDotplotDialogOpen(true),
      loading: status.get_rgg_dotplot.inProgress,
    },
    {
      label: "Cluster Annotation",
      id: "ctap",
      function: undefined,
      loading: false,
    },
  ];

  useEffect(() => {
    // if (obs) {
    //   dispatch(reset(true));
    // }
    
    console.log(typeof fileID, status);

    if (typeof fileID === "string") {
      dispatch(setActiveFile(fileID));

      if (!status.get_file_hierarchy.inProgress) {
        get_file_hierarchy(fileID, dispatch);
      }
      if (!status.get_genes.inProgress) {
        get_genes(fileID, dispatch);
      }
    }
  }, []);

  return (
    <Grid container direction="row" columnGap={1} height="100%" xs>
      <Grid item width={200} height="100%" overflow="clip">
        <Stack direction="column" height="100%" rowGap={1}>
          <Stack
            direction="column"
            height="100%"
            rowGap={1}
            p={1}
            sx={{
              border: "1px solid grey",
            }}
          >
            {steps.map((e, i) => {
              return (
                <LoadingButton
                  variant="contained"
                  disabled={e.function === undefined}
                  key={"button_" + e.id}
                  fullWidth
                  size="small"
                  onClick={e.function}
                  loading={e.loading}
                >
                  <Stack
                    direction="row"
                    width="100%"
                    justifyContent="space-between"
                    gap={1}
                  >
                    <Typography variant="inherit">{i + 1}.</Typography>

                    <Stack
                      direction="row"
                      width="100%"
                      justifyContent="space-around"
                    >
                      <Typography variant="inherit" align="center">
                        {e.label}
                      </Typography>
                    </Stack>
                  </Stack>
                </LoadingButton>
              );
            })}
          </Stack>

          <LDRDialog
            isOpen={isLDRDialogOpen}
            setIsOpen={setIsLDRDialogOpen}
          />
          
          <NLDRDialog
            isOpen={isNLDRDialogOpen}
            setIsOpen={setIsNLDRDialogOpen}
          />
          
          <ClusteringDialog
            isOpen={isClusteringDialogOpen}
            setIsOpen={setIsClusteringDialogOpen}
          />
          
          <DotplotDialog
            isOpen={isDotplotDialogOpen}
            setIsOpen={setIsDotplotDialogOpen}
          />
        </Stack>
      </Grid>

      <Grid item width={250} height="100%">
        <Grid container direction="column" rowGap={1} height="100%">
          <Grid
            item
            xs
            width="100%"
            sx={{
              border: "1px solid grey",
            }}
          >
            <ListEmbeddings />
          </Grid>

          <Grid
            item
            xs
            width="100%"
            sx={{
              border: "1px solid grey",
            }}
          >
            <ListLabels />
          </Grid>

          <Grid
            item
            xs
            sx={{
              border: "1px solid grey",
            }}
          >
            <ListLabelOptions />
          </Grid>
        </Grid>
      </Grid>

      <Grid
        item
        xs
        sx={{
          height: "100%",
        }}
      >
        <Stack direction="column" height="100%" gap={1}>
          <Stack
            direction="row"
            sx={{
              border: "1px solid grey",
              p: 1,
            }}
            gap={1}
          >
            <ButtonGroup size="small">
              <Button
                variant={currentTab == "scatterplot" ? "contained" : "outlined"}
                onClick={() => dispatch(setCurrentTab("scatterplot"))}
              >
                Scatter plot
              </Button>
              <Button
                variant={currentTab == "dotplot" ? "contained" : "outlined"}
                onClick={() => dispatch(setCurrentTab("dotplot"))}
              >
                Dot plot
              </Button>
              <Button
                variant={currentTab == "table" ? "contained" : "outlined"}
                onClick={() => dispatch(setCurrentTab("table"))}
              >
                Table
              </Button>
            </ButtonGroup>

            <DotPlotConfigurationPopover />
            <ImageSavingPopover />
          </Stack>

          <Box
            height="100%"
            sx={{
              border: "1px solid grey",
            }}
          >
            <Box
              sx={{
                height: "100%",
                display: currentTab === "scatterplot" ? "flex" : "none",
              }}
            >
              <ScatterPlot />
            </Box>

            <Stack
              height="100%"
              sx={{
                height: "100%",
                display: currentTab === "dotplot" ? "flex" : "none",
              }}
            >
              <Stack direction="row"></Stack>

              <DotPlot />
            </Stack>

            <Box
              sx={{
                height: "100%",
                display: currentTab === "table" ? "flex" : "none",
              }}
            >
              {/* <GeneGroupTable /> */}
            </Box>
          </Box>
        </Stack>
      </Grid>
    </Grid>
  );
}
