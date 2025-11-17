

import { Button, Stack, Typography } from "@mui/material";
import { useAppSelector } from "../../redux/hooks/hooks";
import CurrentProgress from "../OverlayCurrentProgress";
import { useEffect, useState } from "react";
import { theme } from "@/lib/design";

export default function ListSelectedObservations() {
  
  const status = useAppSelector((state) => state.plotReducer.status.Metadata);
  const cats = useAppSelector((state) => state.plotReducer.anndata.obs.indices?.categories)
  const codes = useAppSelector((state) => state.plotReducer.anndata.obs.indices?.codes)
  const selectedClusters = useAppSelector((state) => state.plotReducer.filtering.selected.clusters);
  
  const [points, setPoints] = useState<number[]>([]);
  
  useEffect(() => {
    
    if (selectedClusters && codes) {
      
      let indices: number[] = [];
      
      selectedClusters.forEach((cluster) => {
        const index = cats?.findIndex((cat) => cat === cluster);
        if (index) {
          indices.push(index)
        }
      })
      
      const allSelectedPoints = codes.reduce((acc, cur, i) => {
        
        if (cur in indices) {
          acc.push(i);
        }
        
        return acc
      }, [] as number[])
      
      setPoints(allSelectedPoints);
      
    }
    
  }, [selectedClusters])
  
  if (status.inProgress) {
    return (
      <CurrentProgress
        status={status}
      />
    )
  }

  return (
    <Stack
      direction="column"
      sx={{
        width: "100%",
        minHeight: "100%",
        backgroundColor: theme.palette.background.paper,
      }}
      justifyContent="space-between"
    >
      <Typography
        sx={{
          height: "2vh",
          p: 0.5,
          color: theme.palette.text.secondary,
          fontSize: theme.typography.fontSize,
          fontWeight: "bold"
        }}
      >
        Total selected cells:{" "}
        {points.length === 0 ? 0 : points.length.toLocaleString(undefined, {
          minimumIntegerDigits: 3,
        })}
      </Typography>
      <Stack
        direction="column"
        sx={{
          height: "96vh",
          width: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {selectedClusters ? (
          selectedClusters
            .map((e, i) => {
              return (
                <Button
                  key={"selected_cluster_text" + i}
                  size="small"
                  sx={{
                    color: theme.palette.text.secondary,
                    justifyContent: "start",
                    overflowX: "clip",
                    textTransform: "initial",
                    fontSize: theme.typography.fontSize,
                    "&:disabled": {
                      cursor: "not-allowed",
                      pointerEvents: "all !important",
                    },
                  }}
                >
                  {e}
                </Button>
              );
            })
        ) : (
          <></>
        )}
      </Stack>
    </Stack>
  );
}
