
import { theme } from "@/app/layout";
import { useCeleryFileRGGMutation } from "@/lib/redux/api/api";
import { useAppDispatch } from "@/lib/redux/hooks/hooks";
import { setGDEField } from "@/lib/redux/reducers/plotReducer";
import { geneExpressionData } from "@/lib/types";
import { pollTaskStatus } from "@/lib/util/handlerPollingTaskStatus";
import {
  Button,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { MouseEvent } from "react";

export function PopoverTableData(props: {
  title: string;
  params: Object;
  anchorEl: HTMLButtonElement | null;
  handleClick: (event: MouseEvent<HTMLButtonElement>) => void;
  handleClose: () => void;
}) {
  
  const dispatch = useAppDispatch();
  const [getRGG] = useCeleryFileRGGMutation();
  
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
                  
                  type parsedDataType = {
                    table: geneExpressionData[];
                    dendro: string;
                    n_genes: number;
                    n_clusters: number;
                  };
                  
                  getRGG({
                    unsKey: props.params.clustering as string,
                    nGenes: props.params.n_top_genes as number,
                    selectedGenes: [],
                  })
                    .then((data) => {
                      
                      if (data.data?.ok) {
                        
                        pollTaskStatus(
                          data.data.response,
                          "celeryFileRGG",
                          dispatch,
                          (result: parsedDataType) => {
                            dispatch(
                              setGDEField({
                                field: "expression",
                                value: result.table
                              })
                            );
                            dispatch(
                              setGDEField({
                                field: "nGenes",
                                value: result.n_genes,
                              })
                            );
                            dispatch(
                              setGDEField({
                                field: "nClusters",
                                value: result.n_clusters,
                              })
                            );
                            dispatch(
                              setGDEField({
                                field: "dendrogram",
                                value: JSON.parse(result.dendro),
                              })
                            );
                            
                          }
                        )
                      }
                      
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
