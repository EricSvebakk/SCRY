
import { Stack } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { useState } from "react";
import { setAnndataField } from "@/lib/redux/reducers/plotReducer";
import { theme } from "@/lib/design";
import { useLazyFileHierarchyQuery, useLazyFileObsQuery } from "@/lib/redux/api/api";
import ButtonSecondary from "../custom/ButtonSecondary";
import DialogClustering from "../modals/DialogClustering";
import DialogAutoAnnotation from "../modals/DialogAutoAnnotation";
import ButtonList from "../custom/ButtonList";

export default function ListClusterings() {
  
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs);
  const statusHierachy = useAppSelector((state) => state.plotReducer.statusBackend.metadata);
  const statusObservation = useAppSelector((state) => state.plotReducer.statusBackend.fileObs);
  const statusLeiden = useAppSelector((state) => state.plotReducer.statusBackend.Leiden);
  
  const dispatch = useAppDispatch();
  const [getObs] = useLazyFileObsQuery();
  
  const [isClusteringDialogOpen, setIsClusteringDialogOpen] = useState<boolean>(false);
  const [isAutoAnnotDialogOpen, setIsAutoAnnotDialogOpen] = useState<boolean>(false);
  
  return (
    <Stack
      direction="column"
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "100%",
        backgroundColor: theme.palette.background.paper,
      }}
      justifyContent="end"
    >
      <ButtonList
        items={obs.keys ?? []}
        selectedItem={obs.selectedKey}
        statusIncoming={statusHierachy}
        statusOutgoing={statusObservation}
        placeholder="No observations"
        onClick={(item) => {
          dispatch(
            setAnndataField({
              attribute: "obs",
              field: "selectedKey",
              value: item,
            })
          );

          getObs({
            obs: item,
          });
        }}
      />

      <ButtonSecondary
        title="+ Create Observation"
        onClick={() => setIsClusteringDialogOpen(true)}
        loading={statusLeiden.inProgress}
        disabled={statusHierachy.inProgress}
        sx={{
          borderTop: "1px solid grey",
        }}
      />

      {/* <ButtonSecondary
        title="+ Create Auto-Annotation"
        onClick={() => setIsAutoAnnotDialogOpen(true)}
        loading={statusLeiden.inProgress}
        disabled={statusHierachy.inProgress}
        sx={{
          borderTop: "1px solid grey",
        }}
      /> */}

      <DialogClustering
        isOpen={isClusteringDialogOpen}
        setIsOpen={setIsClusteringDialogOpen}
      />

      {/* <DialogAutoAnnotation
        isOpen={isAutoAnnotDialogOpen}
        setIsOpen={setIsAutoAnnotDialogOpen}
      /> */}
    </Stack>
  );
  
}