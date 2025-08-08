
import { Stack } from "@mui/material";
import { useAppSelector } from "../../redux/hooks/hooks";
import CurrentProgress from "../OverlayCurrentProgress";
import { MouseEvent, useEffect, useState } from "react";
import { theme } from "@/app/layout";
import { PopoverTableData } from "../modals/popoverTableData";

export default function ListTableData() {
  
  const status = useAppSelector((state) => state.plotReducer.status.get_file_hierarchy);
  const uns = useAppSelector((state) => state.plotReducer.anndata.uns.keys) as any;
  
  const [tableData, setTableData] = useState<string[]>([]);
  
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
   useEffect(() => {
     if (uns) {
       const newTableData = Object.keys(uns).filter((e: string) =>
         Object.keys(uns[e]).includes("genes_present")
       );

       setTableData(newTableData);
     }
   }, [uns]);
  
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
          height: "80vh",
          overflowY: "auto",
        }}
      >
        {tableData ? (
          tableData
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .map((e, i) => {
              return (
                <PopoverTableData
                  key={"popover_connectivities" + i}
                  title={e}
                  params={uns[e].params}
                  anchorEl={anchorEl}
                  handleClick={handleClick}
                  handleClose={handleClose}
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
