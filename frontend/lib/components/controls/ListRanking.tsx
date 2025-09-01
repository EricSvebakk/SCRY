
import { Stack } from "@mui/material";
import { useAppSelector } from "../../redux/hooks/hooks";
import CurrentProgress from "../OverlayCurrentProgress";
import { MouseEvent, useEffect, useState } from "react";
import { theme } from "@/app/layout";
import { PopoverConnectivities } from "../modals/popover/PopoverConnectivities";

export default function ListRanking() {
  
  const status = useAppSelector((state) => state.plotReducer.status.get_file_hierarchy);
  const uns = useAppSelector((state) => state.plotReducer.anndata.uns.keys) as any;
  
  const [rankings, setRankings] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  useEffect(() => {
    
    if (uns) {
      const newRankings = Object.keys(uns)
        .filter((e: string) => e.includes("rank_genes_groups"))
      
      setRankings(newRankings)
    }
    
  }, [uns])
  
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
      <Stack
        direction="column"
        sx={{
          width: "100%",
          height: "30vh",
          overflowY: "auto",
        }}
      >
        {rankings ? (
          rankings
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .map((e, i) => {
              return (
                <PopoverConnectivities
                  key={"popover_connectivities" + i}
                  title={e}
                  titleLabel="Ranking"
                  connectivityParams={uns[e].params}
                  anchorEl={anchorEl}
                  handleClick={handleClick}
                  handleClose={handleClose}
                  width={400}
                />
              );
            })
        ) : (
          <></>
        )}
      </Stack>

    </Stack>
  );
}
