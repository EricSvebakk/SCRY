
import { Stack } from "@mui/material";
import { useAppSelector } from "../../redux/hooks/hooks";
import CurrentProgress from "../OverlayCurrentProgress";
import { MouseEvent, useEffect, useState } from "react";
import { theme } from "@/app/layout";
import { PopoverConnectivities } from "../modals/popover/PopoverConnectivities";

export default function ListConnectivities() {
  
  const status = useAppSelector((state) => state.plotReducer.statusBackend.fileHierarchy);
  const uns = useAppSelector((state) => state.plotReducer.anndata.uns.keys) as any;
  
  const [connectivities, setConnectivities] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  useEffect(() => {
    
    if (uns) {
      
      const newConnectivities = Object.keys(uns)
        .filter((e: string) => uns[e] && Object.keys(uns[e]).includes("connectivities_key"));
      
      setConnectivities(newConnectivities)
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
          height: "20vh",
          overflowY: "auto",
        }}
      >
        {connectivities ? (
          connectivities
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .map((e, i) => {
              return (
                <PopoverConnectivities
                  key={"popover_connectivities" + i}
                  title={e}
                  titleLabel="Connectivity"
                  connectivityParams={uns[e]?.params}
                  anchorEl={anchorEl}
                  handleClick={handleClick}
                  handleClose={handleClose}
                  width={200}
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
