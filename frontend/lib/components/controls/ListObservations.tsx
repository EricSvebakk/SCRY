
import { Button, Stack } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { useState } from "react";
import { setAnndataField } from "@/lib/redux/reducers/plotReducer";
import CurrentProgress from "../OverlayCurrentProgress";
import { theme } from "@/app/layout";
import ButtonSecondary from "../custom/ButtonSecondary";
import DialogClustering from "../modals/DialogClustering";
import AutoAnnotationDialog from "../modals/AutoAnnotationDialog";
import { useLazyFileObsQuery } from "@/lib/redux/api/api";

export default function ListClusterings() {
  
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs);
  const status = useAppSelector((state) => state.plotReducer.statusBackend.fileHierarchy)
  
  const dispatch = useAppDispatch();
  const [getObs] = useLazyFileObsQuery();
  
  const [isClusteringDialogOpen, setIsClusteringDialogOpen] = useState<boolean>(false);
  const [isAutoAnnotDialogOpen, setIsAutoAnnotDialogOpen] = useState<boolean>(false);
  
  
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
          height: "54vh",
          width: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {obs.keys ? (
          [...obs.keys]
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .map((e) => {
              const isSelected = obs.selectedKey === e;

              return (
                <Button
                  key={"accordion_" + e}
                  size="small"
                  variant="text"
                  disabled={isSelected}
                  sx={{
                    backgroundColor: isSelected ? theme.palette.action.selected : "",
                    color: theme.palette.text.secondary,
                    justifyContent: "start",
                    overflowX: "clip",
                    fontWeight: obs.selectedKey === e ? "bold" : "",
                    textTransform: "initial",
                    fontSize: theme.typography.fontSize,
                  }}
                  onClick={() => {
                    dispatch(
                      setAnndataField({
                        attribute: "obs",
                        field: "selectedKey",
                        value: e,
                      })
                    );
                    
                    getObs({
                      obs: e
                    });
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

      <ButtonSecondary
        title="+ Create Observation"
        onClick={() => setIsClusteringDialogOpen(true)}
        sx={{
          borderTop: "1px solid grey",
        }}
      />

      <ButtonSecondary
        title="+ Create Auto-Annotation"
        onClick={() => setIsAutoAnnotDialogOpen(true)}
        sx={{
          borderTop: "1px solid grey",
        }}
      />

      <DialogClustering
        isOpen={isClusteringDialogOpen}
        setIsOpen={setIsClusteringDialogOpen}
      />

      <AutoAnnotationDialog
        isOpen={isAutoAnnotDialogOpen}
        setIsOpen={setIsAutoAnnotDialogOpen}
      />
      
    </Stack>
  );
  
}