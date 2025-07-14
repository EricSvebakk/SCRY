import { Button, Stack } from "@mui/material";
import { setAnndataField, setCurrentTab } from "../../redux/reducers/plotReducer";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { get_file_obsm } from "@/lib/fetch/get_file_obsm";
import CurrentProgress from "../OverlayCurrentProgress";

export default function ListEmbeddings() {
  
  const fileID = useAppSelector((state) => state.fileReducer.activeFile);
  const obsm = useAppSelector((state) => state.plotReducer.anndata.obsm);
  const status = useAppSelector((state) => state.plotReducer.status.get_file_hierarchy);

  const dispatch = useAppDispatch();

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
        height: "100%",
        overflowY: "auto",
      }}
    >
      {obsm.keys ? [...obsm.keys]
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map((e) => {
          return (
            <Stack key={"stack" + e} direction="row">
              <Button
                fullWidth
                key={"accordion_" + e}
                disabled={obsm.selectedKey === e}
                sx={{
                  justifyContent: "start",
                  overflowX: "clip",
                  fontWeight: obsm.selectedKey === e ? "bold" : "",
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
                  dispatch(setCurrentTab("scatterplot"));
                  get_file_obsm(fileID, e, dispatch);
                }}
              >
                {e}
              </Button>
            </Stack>
          );
        }) : <></>}
    </Stack>
  );
}
