
import { useCeleryFileCopyMutation, useLazySystemFilesQuery } from "@/lib/redux/api/api";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { pollTaskStatus } from "@/lib/util/handlerPollingTaskStatus";
import { Close, ContentCut } from "@mui/icons-material";
import { Button, IconButton, Popover, Stack, TextField, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import { MouseEvent, useEffect, useState } from "react";

export function PopoverSubset() {
 
  const fileID = useAppSelector((state) => state.fileReducer.activeFile);
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs);
  const obsm = useAppSelector((state) => state.plotReducer.anndata.obsm);
  const selectedClusters = useAppSelector((state) => state.plotReducer.filtering.selected.clusters);
  
  const router = useRouter();
  
  const dispatch = useAppDispatch();
  const [getFileCopy] = useCeleryFileCopyMutation();
  
  const [filename, setFilename] = useState("");
  const [filenameError, setFilenameError] = useState(false);
  
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover-savedotplot" : undefined;
  
  useEffect(() => {
    if (open && filename === "") {
      setFilename(fileID.split(".")[0] + "_copy.h5ad")
    }
  }, [anchorEl]);
  
  return (
    <>
      <IconButton
        size="small"
        disabled={!obsm.selectedKey || !obs.selectedKey}
        onClick={handleClick}
        aria-describedby={id}
        sx={{
          p: 0,
          minHeight: 0,
          minWidth: 0,
        }}
      >
        <ContentCut />
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Stack
          direction="column"
          width={300}
          height="fit-content"
          p={1}
          gap={1.5}
        >
          <Stack direction="row" justifyContent="end" width="100%">
            <IconButton size="small" onClick={() => handleClose()}>
              <Close />
            </IconButton>
          </Stack>
          
          <TextField
            variant="outlined"
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            label="Subset file name"
            value={filename}
            error={filenameError}
            onChange={(event) => {
              setFilename(event.target.value);
            }}
          />

          <Tooltip
            enterDelay={0}
            placement="bottom"
            title="This will create and open a new file with the selected clusters"
          >
            <Button
              variant="contained"
              onClick={() => {
                
                if (obs && obs.selectedKey && filename !== "") {
                  
                  setFilenameError(false);
                  
                  getFileCopy({
                    newFileID: filename,
                    selectedObs: obs.selectedKey!,
                    selectedObsClusters: selectedClusters
                  })
                  .then((data) => {
                    if (data.data?.ok) {
                      pollTaskStatus(
                        data.data.response,
                        "celeryFileCopy",
                        dispatch,
                        () => {
                          router.push(`/${filename}`);
                          router.refresh();
                        }
                      )
                    }
                  })
                  
                } else {
                  setFilenameError(true)
                }
                
              }}
            >
              Create subset
            </Button>
          </Tooltip>
        </Stack>
      </Popover>
    </>
  );
  
}