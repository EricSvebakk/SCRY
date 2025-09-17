
import { theme } from "@/app/layout";
import { get_rgg_dotplot } from "@/lib/fetch/workflow/get_rgg_dotplot";
import { useCeleryCelltypistAnnotateMutation, useCeleryFileRGGMutation } from "@/lib/redux/api/api";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { pollTaskStatus } from "@/lib/util/handlerPollingTaskStatus";
import {
  Button,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { MouseEvent, useEffect } from "react";

export function PopoverTableData(props: {
  title: string;
  params: Object;
  anchorEl: HTMLButtonElement | null;
  handleClick: (event: MouseEvent<HTMLButtonElement>) => void;
  handleClose: () => void;
}) {
  
  const activeFile = useAppSelector((state) => state.fileReducer.activeFile);
  const userID = useAppSelector((state) => state.fileReducer.userID);
  
  const dispatch = useAppDispatch();
  const [getRGG, { data, isSuccess } ] = useCeleryFileRGGMutation();
  
  useEffect(() => {
    if (isSuccess) {
      pollTaskStatus(
        data.response.id,
        "RGG",
        dispatch,
      );
    }
  }, [data, isSuccess]);
  
  const open = Boolean(props.anchorEl);
  const id = open ? "simple-popover-table-data" : undefined;
  
  return (
    <>
      <Tooltip title={props.title} placement="right">  
        <Button
          fullWidth
          sx={{
            color: theme.palette.text.secondary,
            justifyContent: "start",
            overflowX: "clip",
            textTransform: "initial",
            fontSize: theme.typography.fontSize,
          }}
          size="small"
          onClick={props.handleClick}
        >
          {props.title}
        </Button>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={props.anchorEl}
        onClose={props.handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Stack
          direction="column"
          width={280}
          height="fit-content"
          p={1}
          gap={1}
        >
          <Stack
            direction="column"
            sx={{
              border: "1px solid grey",
            }}
            p={1}
            rowGap={1}
          >
            {props.params ? (
              Object.entries(props.params).map((e, i) => (
                <Stack
                  key={"table_data_param" + i}
                  direction="row"
                  justifyContent="space-between"
                  width="100%"
                >
                  <Typography key={"table_data_param" + i + "_key"}>
                    {e[0]}
                  </Typography>
                  <Typography key={"table_data_param" + i + "_value"}>
                    {e[1] === null ? "W.I.P" : e[1]}
                  </Typography>
                </Stack>
              ))
            ) : (
              <></>
            )}
            <Button
              variant="contained"
              onClick={() => {
                
                if (("n_top_genes" in props.params) && ("clustering" in props.params)) {
                  
                  getRGG({
                    fileID: activeFile,
                    userID: userID,
                    unsKey: props.params.clustering as string,
                    nGenes: props.params.n_top_genes as number,
                    selectedGenes: [],
                  })
                  
                  props.handleClose();
                }
              }}
            >
              Show plot
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
}
