import { Button, Stack } from "@mui/material";
import { setAnndataField } from "../../redux/reducers/plotReducer";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { get_file_obsm } from "@/lib/fetch/get_file_obsm";
import CurrentProgress from "../OverlayCurrentProgress";
import DialogDimensionalReduction from "../modals/DialogDimensionalReduction";
import { useState } from "react";
import { theme } from "@/app/layout";
import ButtonSecondary from "../custom/ButtonSecondary";

export default function ListEmbeddings() {
  
  const fileID = useAppSelector((state) => state.fileReducer.activeFile);
  const obsm = useAppSelector((state) => state.plotReducer.anndata.obsm);
  const status = useAppSelector((state) => state.plotReducer.status.get_file_hierarchy);

  const dispatch = useAppDispatch();

  const [isNLDRDialogOpen, setIsNLDRDialogOpen] = useState<boolean>(false);
  
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
        {obsm.keys ? (
          [...obsm.keys]
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .map((e) => {
              return (
                <Stack key={"stack" + e} direction="row">
                  <Button
                    fullWidth
                    key={"accordion_" + e}
                    disabled={obsm.selectedKey === e}
                    sx={{
                      color: theme.palette.text.secondary,
                      justifyContent: "start",
                      overflowX: "clip",
                      textTransform: "initial",
                      fontWeight: obsm.selectedKey === e ? "bold" : "",
                      fontSize: theme.typography.fontSize
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
                      get_file_obsm(fileID, e, dispatch);
                    }}
                  >
                    {e}
                  </Button>
                </Stack>
              );
            })
        ) : (
          <></>
        )}
      </Stack>

      <ButtonSecondary
        title="+ Create Embedding"
        onClick={() => setIsNLDRDialogOpen(true)}
        sx={{
          borderTop: "1px solid grey"
        }}
      />

      <DialogDimensionalReduction
        isOpen={isNLDRDialogOpen}
        setIsOpen={setIsNLDRDialogOpen}
      />
    </Stack>
  );
}
