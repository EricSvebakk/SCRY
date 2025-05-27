
"use client"

import {
  reset,
} from "@/lib/redux/reducers/plotReducer";
import {
  Button,
  Grid,
  Stack,
} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import ListLabels from "@/lib/components/controls/ListLabels";
import { ScatterPlot } from "@/lib/components/ScatterPlot";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { setActiveFile } from "@/lib/redux/reducers/fileReducer";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { get_file_hierarchy } from "@/lib/fetch/get_file_hierarchy";
import UMAPDialog from "@/lib/components/modals/UMAPDialog";
import LeidenDialog from "@/lib/components/modals/LeidenDialog";
import { get_genes } from "@/lib/fetch/get_genes";
import RGGDialog from "@/lib/components/modals/RGGDialog";
import { DotPlot } from "@/lib/components/DotPlot";
import DotplotDialog from "@/lib/components/modals/DotplotDialog";
import { ListLabelOptions } from "@/lib/components/controls/ListLabelOptions";
import ListEmbeddings from "@/lib/components/controls/ListEmbeddings";
import MergeDialog from "@/lib/components/modals/MergeDialog";
import d3ToPng from "d3-svg-to-png";
import { GeneGroupTable } from "@/lib/components/GeneGroupTable";

export default function FileIdPage({ }) {
  
  const { fileID } = useParams();
  
  const obs = useAppSelector((state) => state.plotReducer.obs);
  
  const inProgress = useAppSelector((state) => state.plotReducer.inProgress);
  
  const dispatch = useAppDispatch();
  
  const [isUMAPDialogOpen, setIsUMAPDialogOpen] = useState(false);
  const [isLeidenDialogOpen, setIsLeidenDialogOpen] = useState(false);
  const [isRGGDialogOpen, setIsRGGDialogOpen] = useState(false);
  const [isDotplotDialogOpen, setIsDotplotDialogOpen] = useState(false);
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);
  
  useEffect(() => {
    
    if (obs) {
      dispatch(reset(true));
    }
    
    if (typeof fileID === "string") {
      dispatch(setActiveFile(fileID));
      
      if (!inProgress.get_file_hierarchy) {
        get_file_hierarchy(fileID, dispatch);
      }
      if (!inProgress.get_genes) {
        get_genes(fileID, dispatch);
      }
    }
    
  }, []);

  
  return (
    <Grid
      container
      direction="row"
      columnGap={1}
      height="100%"
      xs
    >
      <Grid
        item
        xs={2}
        height="100%"
        width="fit-content"
        overflow="clip"
        >
        <Stack
          direction="column"
          height="100%"
          rowGap={1}
        >
          <Stack
            direction="column"
            rowGap={1}
            p={1}
            sx={{
              border: "1px solid grey",
            }}
          >
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
            
            <LoadingButton
              variant="outlined"
              size="small"
              onClick={() => {
                setIsDotplotDialogOpen(true)
              }}
              loading={inProgress.get_rgg_dotplot}
              fullWidth
            >
              Fetch RGG Dotplot
            </LoadingButton>
            
            <LoadingButton
              variant="outlined"
              size="small"
              onClick={() => setIsMergeDialogOpen(true)}
              loading={inProgress.generate_ranked_genes_groups}
              fullWidth
            >
              Merge groups
            </LoadingButton>
            
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
            
            <MergeDialog
              isOpen={isMergeDialogOpen}
              setIsOpen={setIsMergeDialogOpen}
            />
          </Stack>
          
          <Stack
            direction="column"
            height="100%"
            rowGap={1}
            p={1}
            sx={{
              border: "1px solid grey",
            }}
          >
            WIP
          </Stack>
          
        </Stack>
      </Grid>
      
      <Grid
        item
        xs={2}
      >
        <Stack
          direction="column"
          rowGap={1}
        >
          <ListEmbeddings />
          <ListLabels />
          <ListLabelOptions />
        </Stack>
      </Grid>

      <Grid
        item
        // width={500}
        xs
        sx={{
          border: "1px solid grey",
        }}
      >
        <Stack direction="column" height="100%">
          <Button variant="outlined" onClick={() => {
            d3ToPng("#svgHere", "newImage", {
              scale: 3,
              format: "png",
              // quality: 
              download: true,
            })
          }}>
            Download
          </Button>
          <ScatterPlot />
        </Stack>
      </Grid>
      
      <Grid
        item
        xs
        sx={{
          border: "1px solid grey",
        }}
      >
        <Stack direction="column" height="100%">
          <Button variant="outlined" onClick={() => {
            d3ToPng("#bigtest", "newImage", {
              scale: 3,
              format: "png",
              // quality: 
              download: true,
              background: "white"
            })
          }}>
            Download
          </Button>
          <DotPlot />
        </Stack>
      </Grid>
      
    </Grid>
  );
  
}