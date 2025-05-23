
"use client"

import {
  reset,
  setSelectedEmbedding,
} from "@/lib/redux/reducers/plotReducer";
import {
  Button,
  Divider,
  Grid,
  Stack,
  Tooltip,
} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import CategoryAccordion from "@/lib/components/CategoryAccordion";
import { ScatterPlot } from "@/lib/components/ScatterPlot";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { setActiveFile } from "@/lib/redux/reducers/fileReducer";
import { TooltipKey, tooltips } from "@/lib/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { get_file_hierarchy } from "@/lib/fetch/get_file_hierarchy";
import { get_file_obsm } from "@/lib/fetch/get_file_obsm";
import UMAPDialog from "@/lib/components/modals/UMAPDialog";
import LeidenDialog from "@/lib/components/modals/LeidenDialog";
import { get_genes } from "@/lib/fetch/get_genes";
import RGGDialog from "@/lib/components/modals/RGGDialog";
import { DotPlot } from "@/lib/components/DotPlot";
import DotplotDialog from "@/lib/components/modals/DotplotDialog";

export default function FileIdPage({ }) {
  
  const { fileID } = useParams();
  
  const hierarchy = useAppSelector((state) => state.plotReducer.hierarchy)
  const obs = useAppSelector((state) => state.plotReducer.obs);
  
  const selectedEmbedding = useAppSelector((state) => state.plotReducer.selectedEmbedding);
  const selectedCategory = useAppSelector((state) => state.plotReducer.selectedCategory);
  const selectedLabels = useAppSelector((state) => state.plotReducer.selectedLabels);
  const selectedGenes = useAppSelector((state) => state.plotReducer.selectedGenes);
  
  const inProgress = useAppSelector((state) => state.plotReducer.inProgress);
  
  const dispatch = useAppDispatch();
  
  const [isUMAPDialogOpen, setIsUMAPDialogOpen] = useState(false);
  const [isLeidenDialogOpen, setIsLeidenDialogOpen] = useState(false);
  const [isRGGDialogOpen, setIsRGGDialogOpen] = useState(false);
  const [isDotplotDialogOpen, setIsDotplotDialogOpen] = useState(false);
  
  useEffect(() => {
    
    if (obs) {
      dispatch(reset(true));
    }
    
    if (typeof fileID === "string") {
      dispatch(setActiveFile(fileID));
      
      get_file_hierarchy(fileID, dispatch);
      get_genes(fileID, dispatch);
    }
    
  }, []);

  
  return (
    <Grid container direction="row" columnGap={1} height="100%">
      <Grid
        item
        xs={3}
        p={1}
        width="fit-content"
        height="100%"
        sx={{
          border: "1px solid green",
        }}
        overflow="clip"
      >
        <Stack direction="column" gap={2}>
          <Stack direction="column">
            {hierarchy ? (
              [...hierarchy.obsm]
                .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
                .map((e) => {
                  return (
                    <Tooltip
                      key={`tooltip_obsm_${e}`}
                      title={tooltips[e as TooltipKey]}
                      placement="right"
                    >
                      <Button
                        key={`button_obsm_${e}`}
                        variant="contained"
                        disabled={selectedEmbedding === e}
                        onClick={() => {
                          if (typeof fileID === "string") {
                            dispatch(setSelectedEmbedding(e));
                            get_file_obsm(fileID, e, dispatch);
                          }
                        }}
                        size="small"
                        sx={{
                          justifyContent: "flex-start",
                          overflow: "hidden",
                          fontSize: 10,
                        }}
                      >
                        {e}
                      </Button>
                    </Tooltip>
                  );
                })
            ) : (
              <></>
            )}
          </Stack>

          {hierarchy ? <Divider /> : <></>}

          <Stack
            direction="column"
            gap={2}
            height="65vh"
            sx={{
              overflowY: "scroll",
              scrollbarWidth: "thin",
            }}
          >
            <CategoryAccordion />
          </Stack>
        </Stack>
      </Grid>

      <Grid
        item
        // xs
        height={500}
        width={500}
        sx={{
          border: "1px solid blue",
        }}
      >
        <ScatterPlot />
      </Grid>

      <Grid
        item
        xs
        border="1px solid red"
        padding={1}
        textOverflow="ellipsis"
        overflow="hidden"
        sx={
          {
            // backgroundColor: theme.palette.background.paper,
          }
        }
      >
        <Grid container direction="column" gap={1} height="100%">
          <Grid item>
            <LoadingButton
              variant="outlined"
              size="small"
              onClick={() => setIsUMAPDialogOpen(true)}
              loading={inProgress.generate_umap}
              fullWidth
            >
              Generate UMAP
            </LoadingButton>
            <LoadingButton
              variant="outlined"
              size="small"
              onClick={() => setIsLeidenDialogOpen(true)}
              loading={inProgress.generate_leiden}
              fullWidth
            >
              Generate Leiden
            </LoadingButton>
            <LoadingButton
              variant="outlined"
              size="small"
              onClick={() => setIsRGGDialogOpen(true)}
              loading={inProgress.generate_ranked_genes_groups}
              fullWidth
            >
              Generate RGG
            </LoadingButton>
            
            <Tooltip
              title="Fetch Differential Gene Expression"
              placement="right"
            >
              <LoadingButton
                variant="outlined"
                size="small"
                onClick={() => {
                  setIsDotplotDialogOpen(true)
                }}
                loading={inProgress.get_rgg_dotplot}
                fullWidth
              >
                Fetch Dotplot
              </LoadingButton>
            </Tooltip>
          </Grid>
          
          <UMAPDialog
            isOpen={isUMAPDialogOpen}
            setIsOpen={setIsUMAPDialogOpen}
          />
          
          <LeidenDialog
            isOpen={isLeidenDialogOpen}
            setIsOpen={setIsLeidenDialogOpen}
          />
          
          <RGGDialog
            isOpen={isRGGDialogOpen}
            setIsOpen={setIsRGGDialogOpen}
          />
          
          <DotplotDialog
            isOpen={isDotplotDialogOpen}
            setIsOpen={setIsDotplotDialogOpen}
          />

          <Grid item xs>
            <DotPlot />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
  
}