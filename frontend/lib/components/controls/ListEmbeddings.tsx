import { Stack } from "@mui/material";
import { setAnndataField } from "../../redux/reducers/plotReducer";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { useState } from "react";
import { theme } from "@/lib/design";
import { useLazyObsmQuery } from "@/lib/redux/api/api";
import DialogDimensionalReduction from "../modals/DialogDimensionalReduction";
import ButtonSecondary from "../custom/ButtonSecondary";
import ButtonList from "../custom/ButtonList";

export default function ListEmbeddings() {
  
  const obsm = useAppSelector((state) => state.plotReducer.anndata.obsm);
  const statusHierachy = useAppSelector((state) => state.plotReducer.status.Metadata);
  const statusNLDR = useAppSelector((state) => state.plotReducer.status.Embedding);
  const statusEmbedding = useAppSelector((state) => state.plotReducer.status.Obsm)
  
  const dispatch = useAppDispatch();
  const [getObsm] = useLazyObsmQuery();
  
  const [isNLDRDialogOpen, setIsNLDRDialogOpen] = useState<boolean>(false);

  return (
    <Stack
      direction="column"
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "100%",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <ButtonList
        items={(obsm.keys ?? []).map((e) => e.replaceAll(" ", "-"))}
        selectedItem={obsm.selectedKey}
        statusIncoming={statusHierachy}
        statusOutgoing={statusEmbedding}
        placeholder="No embeddings"
        onClick={(item) => {
          dispatch(
            setAnndataField({
              attribute: "obsm",
              field: "selectedKey",
              value: item,
            })
          );

          getObsm({
            obsm: item,
          });
        }}
      />

      <ButtonSecondary
        title="+ Create Embedding"
        loading={statusNLDR.inProgress}
        disabled={statusHierachy.inProgress}
        onClick={() => setIsNLDRDialogOpen(true)}
        sx={{
          borderTop: "1px solid grey",
        }}
      />

      <DialogDimensionalReduction
        isOpen={isNLDRDialogOpen}
        setIsOpen={setIsNLDRDialogOpen}
      />
    </Stack>
  );
}
