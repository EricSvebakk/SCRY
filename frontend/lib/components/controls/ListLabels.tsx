
import { Button, Stack } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { useState } from "react";
import { get_file_obs } from "../../fetch/get_file_obs";
import { setAnndataField } from "@/lib/redux/reducers/plotReducer";
import CurrentProgress from "../OverlayCurrentProgress";

export default function ListLabels() {
  
  const fileID = useAppSelector((state) => state.fileReducer.activeFile);
  
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs);
  const obsm = useAppSelector((state) => state.plotReducer.anndata.obsm);
  const status = useAppSelector((state) => state.plotReducer.status.get_file_hierarchy)
  
  const dispatch = useAppDispatch();
  
  const [expanded, setExpanded] = useState(false);
  
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
        height: "30vh",
        width: "100%",
        overflowY: "auto",
      }}
    >
      { obs.keys ? [...obs.keys]
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map((e) => {
          return (
            <Button
              key={"accordion_" + e}
              disabled={obsm.selectedKey === "" || obs.selectedKey == e}
              sx={{
                justifyContent: "start",
                overflowX: "clip",
                fontWeight: obs.selectedKey === e ? "bold" : ""
              }}
              size="small"
              onClick={() => {
                if (obs.selectedKey !== e) {
                  setExpanded(true);
                  
                  dispatch(
                    setAnndataField({
                      attribute: "obs",
                      field: "selectedKey",
                      value: e
                    })
                  );
                  
                  get_file_obs(fileID, e, dispatch);
                }
                else {
                  setExpanded(!expanded);
                }
              }}
            >
              {e}
            </Button>
          );
        }) : <></>}
    </Stack>
  )
  
}