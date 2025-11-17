
import { Button, Popover, Stack, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import CurrentProgress from "../OverlayCurrentProgress";
import { MouseEvent, useEffect, useState } from "react";
import { theme } from "@/lib/design";
import { PopoverTableData } from "../modals/popover/popoverTableData";
import ButtonSecondary from "../custom/ButtonSecondary";
import DialogDotplot from "../modals/DialogDotplot";
import { geneExpressionData } from "@/lib/types";
import { useDGEMutation } from "@/lib/redux/api/api";
import { pollTaskStatus } from "@/lib/util/handlerPollingTaskStatus";
import { setGDEField } from "@/lib/redux/reducers/plotReducer";
import ButtonList from "../custom/ButtonList";

export default function ListRankings() {
  
  const uns = useAppSelector((state) => state.plotReducer.anndata.uns.keys) as any;
  const selectedRanking = useAppSelector((state) => state.plotReducer.data.GDE.selected);
  const status = useAppSelector((state) => state.plotReducer.status.Metadata);
  const statusRGG = useAppSelector((state) => state.plotReducer.status.DGE);
  
  const dispatch = useAppDispatch();
  const [getRGG] = useDGEMutation();
  
  const [isDotplotDialogOpen, setIsDotplotDialogOpen] = useState(false);
  
  const [tableData, setTableData] = useState<string[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  
  
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (key: string, me: MouseEvent<HTMLElement>) => {
    setActiveKey(key);
    setAnchorEl(me.currentTarget);
  };
  const handleClose = () => {
    setActiveKey(null);
    setAnchorEl(null);
  };
  
  useEffect(() => {
    if (uns) {
      const newTableData = Object.keys(uns).filter((e: string) =>
        uns[e] && Object.keys(uns[e]).includes("n_genes")
      );

      setTableData(newTableData);
    }
  }, [uns]);
  
  return (
    <Stack
      direction="column"
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "100%",
        backgroundColor: theme.palette.background.paper,
      }}
      justifyContent="space-between"
    >
      <ButtonList
        items={tableData}
        selectedItem={selectedRanking ?? ""}
        statusIncoming={status}
        statusOutgoing={statusRGG}
        placeholder="No rankings"
        onClick={(item, me) => {
          handleOpen(item, me!);
        }}
      />

      {/* <Stack
        direction="column"
        sx={{
          width: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {tableData ? (
          tableData
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .map((key, i) => (
              <PopoverTableData
                key={key}
                title={key}
                params={uns[key].params}
                onOpen={handleOpen}
              />
            ))
        ) : (
          <></>
        )}
      </Stack> */}

      <Popover
        id={open ? `simple-popover-table-data-${activeKey}` : undefined}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {activeKey && (
          <Stack p={1} width={280} gap={1}>
            <Stack p={1} rowGap={1} sx={{ border: "1px solid grey" }}>
              {uns?.[activeKey]?.params &&
                Object.entries(uns[activeKey].params).map(([k, v], i) => (
                  <Stack key={i} direction="row" justifyContent="space-between">
                    <Typography>{k}</Typography>
                    <Typography>{v === null ? "W.I.P" : String(v)}</Typography>
                  </Stack>
                ))}
              <Button
                variant="contained"
                onClick={() => {
                  const p = uns?.[activeKey]?.params ?? {};
                  if ("n_top_genes" in p && "clustering" in p) {
                    type parsedDataType = {
                      table: geneExpressionData[];
                      dendro: string;
                      n_genes: number;
                      n_clusters: number;
                    };

                    dispatch(
                      setGDEField({
                        field: "selected",
                        value: activeKey,
                      })
                    );

                    getRGG({
                      unsKey: uns[activeKey].params.clustering as string,
                      nGenes: uns[activeKey].params.n_top_genes as number,
                      selectedGenes: [],
                    }).then((data) => {
                      if (data.data?.ok) {
                        pollTaskStatus(
                          data.data.response,
                          data.data.timestamp,
                          "DGE",
                          dispatch,
                          (result: parsedDataType) => {
                            dispatch(
                              setGDEField({
                                field: "expression",
                                value: result.table,
                              })
                            );
                            dispatch(
                              setGDEField({
                                field: "dendrogram",
                                value: JSON.parse(result.dendro),
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
                          }
                        );
                      }
                    });
                  }
                  handleClose();
                }}
              >
                Show plot
              </Button>
            </Stack>
          </Stack>
        )}
      </Popover>

      <ButtonSecondary
        title="+ Generate DGE"
        loading={statusRGG.inProgress}
        onClick={() => setIsDotplotDialogOpen(true)}
        sx={{
          borderTop: "1px solid grey",
        }}
      />

      <DialogDotplot
        isOpen={isDotplotDialogOpen}
        setIsOpen={setIsDotplotDialogOpen}
      />
    </Stack>
  );
}
