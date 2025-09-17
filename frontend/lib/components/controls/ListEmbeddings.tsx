import { Button, Stack } from "@mui/material";
import { setAnndataField } from "../../redux/reducers/plotReducer";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { get_file_obsm } from "@/lib/fetch/get_file_obsm";
import CurrentProgress from "../OverlayCurrentProgress";
import DialogDimensionalReduction from "../modals/DialogDimensionalReduction";
import { useEffect, useState } from "react";
import { theme } from "@/app/layout";
import ButtonSecondary from "../custom/ButtonSecondary";
import { useLazyFileObsmQuery } from "@/lib/redux/api/api";

export default function ListEmbeddings() {
  
  const fileID = useAppSelector((state) => state.fileReducer.activeFile);
  const userID = useAppSelector((state) => state.fileReducer.userID);  
  const obsm = useAppSelector((state) => state.plotReducer.anndata.obsm);
  const status = useAppSelector((state) => state.plotReducer.statusBackend.HIERARCHY);

  const dispatch = useAppDispatch();
  const [getObsm, { data, isSuccess } ] = useLazyFileObsmQuery();

  // useEffect(() => {
  //   if (isSuccess) {
      
  //   }
  // }, [data, isSuccess])
  
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
              const isSelected = obsm.selectedKey === e;
              
              return (
                <Stack key={"stack" + e} direction="row">
                  <Button
                    fullWidth
                    key={"accordion_" + e}
                    disabled={isSelected}
                    sx={{
                      backgroundColor: isSelected ? theme.palette.action.selected : "",                    
                      color: theme.palette.text.secondary,
                      justifyContent: "start",
                      overflowX: "clip",
                      textTransform: "initial",
                      fontWeight: isSelected ? "bold" : "",
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
                      
                      getObsm({
                        fileID: fileID,
                        userID: userID,
                        obsm: e
                      })
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
