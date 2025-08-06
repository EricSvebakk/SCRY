
import { Button, Stack } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { useState } from "react";
import { get_file_obs } from "../../fetch/get_file_obs";
import { setAnndataField } from "@/lib/redux/reducers/plotReducer";
import CurrentProgress from "../OverlayCurrentProgress";
import { theme } from "@/app/layout";
import ButtonSecondary from "../custom/ButtonSecondary";
import DialogClustering from "../modals/DialogClustering";

export default function ListLabels() {
  
  const fileID = useAppSelector((state) => state.fileReducer.activeFile);
  
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs);
  const obsm = useAppSelector((state) => state.plotReducer.anndata.obsm);
  const status = useAppSelector((state) => state.plotReducer.status.get_file_hierarchy)
  
  const dispatch = useAppDispatch();
  
  const [expanded, setExpanded] = useState(false);
  const [isClusteringDialogOpen, setIsClusteringDialogOpen] = useState<boolean>(false);
  
  
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
        // border: "1px solid green",
        backgroundColor: theme.palette.background.paper,
      }}
      justifyContent="space-between"
    >
      <Stack
        direction="column"
        sx={{
          height: "60vh",
          width: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          backgroundColor: theme.palette.background.paper,
          // pointerEvents: "none",
          // cursor: ""
        }}
      >
        {obs.keys ? (
          [...obs.keys]
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .map((e) => {
              
              const isDisabled = obsm.selectedKey === undefined || obs.selectedKey === e;
              
              return (
                // <Tooltip
                //   title={isDisabled ? "Please select an Embedding" : e}
                //   enterDelay={2000}
                //   leaveDelay={0}
                //   placement="right"
                // >
                //   <Box width="100%">
                    <Button
                      key={"accordion_" + e}
                      size="small"
                      variant="text"
                      disabled={isDisabled}
                      sx={{
                        color: theme.palette.text.secondary,
                        justifyContent: "start",
                        overflowX: "clip",
                        fontWeight: obs.selectedKey === e ? "bold" : "",
                        fontSize: 10,
                        "&:disabled": {
                          cursor: "not-allowed",
                          pointerEvents: "all !important",
                        },
                      }}
                      onClick={() => {
                        if (obs.selectedKey !== e) {
                          setExpanded(true);

                          dispatch(
                            setAnndataField({
                              attribute: "obs",
                              field: "selectedKey",
                              value: e,
                            })
                          );

                          get_file_obs(fileID, e, dispatch);
                        } else {
                          setExpanded(!expanded);
                        }
                      }}
                    >
                      {e}
                    </Button>
                //   </Box>
                // </Tooltip>
              );
            })
        ) : (
          <></>
        )}
      </Stack>

      <ButtonSecondary
        title="+ Create Clustering"
        onClick={() => setIsClusteringDialogOpen(true)}
        sx={{
          borderTop: "1px solid grey",
        }}
      />
      
      <DialogClustering
        isOpen={isClusteringDialogOpen}
        setIsOpen={setIsClusteringDialogOpen}
      />
    </Stack>
  );
  
}