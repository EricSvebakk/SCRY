import { Button, Stack } from "@mui/material";
import { setAnndataField } from "../../redux/reducers/plotReducer";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import CurrentProgress from "../OverlayCurrentProgress";
import DialogDimensionalReduction from "../modals/DialogDimensionalReduction";
import { useState } from "react";
import { theme } from "@/app/layout";
import ButtonSecondary from "../custom/ButtonSecondary";
import { useLazyFileObsmQuery } from "@/lib/redux/api/api";

export default function ListEmbeddings() {
  
  const obsm = useAppSelector((state) => state.plotReducer.anndata.obsm);
  const status = useAppSelector((state) => state.plotReducer.statusBackend.fileHierarchy);
  const statusNLDR = useAppSelector((state) => state.plotReducer.statusBackend.celeryFileNLDR);

  const dispatch = useAppDispatch();
  const [getObsm] = useLazyFileObsmQuery();

  
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
      <Stack
        direction="column"
        sx={{
          width: "100%",
          height: "100%",
          overflowY: "auto",
        }}
      >
        {obsm.keys && !status.inProgress ? (
          [...obsm.keys]
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .map((e, i) => {
              const isSelected = obsm.selectedKey === e;

              return (
                <Stack key={"stack" + e} direction="row">
                  <Button
                    fullWidth
                    key={"accordion_" + e}
                    disabled={isSelected}
                    tabIndex={200 + i}
                    sx={{
                      backgroundColor: isSelected
                        ? theme.palette.action.selected
                        : "",
                      color: theme.palette.text.secondary,
                      justifyContent: "start",
                      overflowX: "clip",
                      textTransform: "initial",
                      fontWeight: isSelected ? "bold" : "",
                      fontSize: theme.typography.fontSize,
                    }}
                    size="small"
                    onClick={() => {
                      dispatch(
                        setAnndataField({
                          attribute: "obsm",
                          field: "selectedKey",
                          value: e,
                        })
                      );

                      getObsm({
                        obsm: e,
                      });
                    }}
                  >
                    {e}
                  </Button>
                </Stack>
              );
            })
        ) : (
          <CurrentProgress status={status} />
        )}
      </Stack>

      <ButtonSecondary
        title="+ Create Embedding"
        loading={statusNLDR.inProgress}
        disabled={status.inProgress}
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
