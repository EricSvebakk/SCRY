import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { setDotplotOptions } from "@/lib/redux/reducers/plotReducer";
import { Close, Repeat, Settings } from "@mui/icons-material";
import { Button, ButtonGroup, Grid, IconButton, Popover, Stack, TextField, Tooltip } from "@mui/material";
import { MouseEvent, useEffect, useState } from "react";

export function DotPlotConfigurationPopover() {
  
  const dpOptions = useAppSelector((state) => state.plotReducer.dotplotOptions);
  const expression = useAppSelector((state) => state.plotReducer.geneExpression);
  const dispatch = useAppDispatch();
  
  const [exprMin, setExprMin] = useState(dpOptions.expressionMinDefault.toFixed(2));
  const [exprMax, setExprMax] = useState(dpOptions.expressionMaxDefault.toFixed(2));
  
  const [exprMinError, setExprMinError] = useState(false);
  const [exprMaxError, setExprMaxError] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover-dotplotconfig" : undefined;
  
  // Resets expression range states
  useEffect(() => {
    if (dpOptions.expressionIsDefault) {
      setExprMin(dpOptions.expressionMinDefault.toFixed(2));
      setExprMax(dpOptions.expressionMaxDefault.toFixed(2));
    }
  }, [
    dpOptions.coloring,
    dpOptions.expressionIsDefault,
    dpOptions.expressionMinDefault,
    dpOptions.expressionMaxDefault
  ]);
  
  return (
    <>
      <Tooltip
        enterDelay={0}
        placement="bottom" title="Open settings for dotplot"
        disableFocusListener={expression.length == 0}
      >
        <IconButton
          disabled={expression.length == 0}
          onClick={handleClick}
          aria-describedby={id}
          size="small"
        >
          <Settings />
        </IconButton>
      </Tooltip>
      
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
          width={400}
          height="fit-content"
          p={1}
          gap={1}
        >
          <Stack
            direction="row"
            justifyContent="end"
            width="100%"
          >
            <Tooltip title="reset to default expression range" enterDelay={1000} placement="bottom">              
              <IconButton
                size="small"
                onClick={() => {
                  dispatch(setDotplotOptions({
                    ...dpOptions,
                    expressionIsDefault: true
                  }))
                  setExprMin(dpOptions.expressionMinDefault.toFixed(2));
                  setExprMax(dpOptions.expressionMaxDefault.toFixed(2));
                }}
              >
                <Repeat />
              </IconButton>
            </Tooltip>
            
            <IconButton
              size="small"
              onClick={() => handleClose()}
            >
              <Close />
            </IconButton>
          </Stack>
          
          <Grid
            width="100%"
            container
            direction="row"
            gap={1}
          >
            <Grid item xs>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                label="expr. min"
                value={exprMin}
                error={exprMinError}
                onChange={(event) => {setExprMin(event.target.value);}}
              />
            </Grid>
            <Grid item xs>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                label="expr. max"
                value={exprMax}
                error={exprMaxError}
                onChange={(event) => {setExprMax(event.target.value);}}
              />
              
            </Grid>
            <Grid item xs>              
              <Tooltip placement="bottom" enterDelay={1000} title="Confirm expression range to re-render dotplot">
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    height: "100%"
                  }}
                  // size="small"
                  onClick={() => {
                    const parsedExprMin = parseFloat(exprMin) ?? null;
                    const parsedExprMax = parseFloat(exprMax) ?? null;
                    
                    setExprMinError(parsedExprMin === null);
                    setExprMaxError(parsedExprMax === null);
                    
                    if (parsedExprMin !== null && parsedExprMax !== null) {
                      dispatch(setDotplotOptions({
                        ...dpOptions,
                        expressionMin: parsedExprMin,
                        expressionMax: parsedExprMax,
                        expressionIsDefault: false
                      }))
                    }
                  }}
                >
                  Confirm
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
          
          <ButtonGroup size="small" fullWidth>
            <Button
              variant={dpOptions.coloring == "mean_expr" ? "contained" : "outlined"}
              onClick={() => {
                dispatch(setDotplotOptions({
                  ...dpOptions,
                  coloring: "mean_expr",
                  expressionIsDefault: true
                }))
              }}
            >
              mean
            </Button>
            <Button
              variant={dpOptions.coloring == "logfoldchange" ? "contained" : "outlined"}
              onClick={() => {
                dispatch(setDotplotOptions({
                  ...dpOptions,
                  coloring: "logfoldchange",
                  expressionIsDefault: true
                }))
              }}
            >
              logfold
            </Button>
            <Button
              variant={dpOptions.coloring == "pvals_adj" ? "contained" : "outlined"}
              onClick={() => {
                dispatch(setDotplotOptions({
                  ...dpOptions,
                  coloring: "pvals_adj",
                  expressionIsDefault: true
                }))
              }}
            >
              pval
            </Button>
          </ButtonGroup>
          
          <ButtonGroup size="small" fullWidth>
            
            <Tooltip
              title="Highlight max expression per cluster"
              placement="bottom"
              enterDelay={1000}
            >
              <Button
                variant={dpOptions.highlight == "cluster" ? "contained" : "outlined"}
                onClick={() => {
                  dispatch(setDotplotOptions({
                    ...dpOptions,
                    highlight: "cluster"
                  }))
                }}
              >
                cluster
              </Button>
            </Tooltip>
            
            <Tooltip
              title="Highlight max expression per gene"
              placement="bottom"
              enterDelay={1000}
            >
              <Button
                variant={dpOptions.highlight == "gene" ? "contained" : "outlined"}
                onClick={() => {
                  dispatch(setDotplotOptions({
                    ...dpOptions,
                    highlight: "gene"
                  }))
                }}
              >
                gene
              </Button>
            </Tooltip>
            
            <Tooltip
              title="Removes highlighting"
              placement="bottom"
              enterDelay={1000}
            >              
              <Button
                variant={dpOptions.highlight == "none" ? "contained" : "outlined"}
                onClick={() => {
                  dispatch(setDotplotOptions({
                    ...dpOptions,
                    highlight: "none"
                  }))
                }}
              >
                None
              </Button>
            </Tooltip>
          </ButtonGroup>
          
          {/* <ButtonGroup size="small" fullWidth>
            
            <Tooltip
              title="Highlight max expression per cluster"
              placement="bottom"
              enterDelay={1000}
            >
              <Button
                // variant={dpOptions.highlight == "cluster" ? "contained" : "outlined"}
                onClick={() => {
                  // dispatch(setDotplotOptions({
                  //   ...dpOptions,
                  //   highlight: "cluster"
                  // }))
                }}
              >
                Dendrogram
              </Button>
            </Tooltip>
            
            <Tooltip
              title="Highlight max expression per gene"
              placement="bottom"
              enterDelay={1000}
            >
              <Button
                // variant={dpOptions.highlight == "gene" ? "contained" : "outlined"}
                onClick={() => {
                  // dispatch(setDotplotOptions({
                  //   ...dpOptions,
                  //   highlight: "gene"
                  // }))
                }}
              >
                Bucket
              </Button>
            </Tooltip>
            
            <Tooltip
              title="Removes highlighting"
              placement="bottom"
              enterDelay={1000}
            >              
              <Button
                // variant={dpOptions.highlight == "none" ? "contained" : "outlined"}
                onClick={() => {
                  // dispatch(setDotplotOptions({
                  //   ...dpOptions,
                  //   highlight: "none"
                  // }))
                }}
              >
                None
              </Button>
            </Tooltip>
          </ButtonGroup> */}
        </Stack>
      </Popover>
    </>
  )
  
}