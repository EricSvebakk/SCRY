
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { setPlotConfigField, setTrigger } from "@/lib/redux/reducers/plotReducer";
import { PlotConfigurationData, triggerOptions } from "@/lib/types";
import { Close, Save } from "@mui/icons-material";
import { Button, Checkbox, IconButton, Popover, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { MouseEvent, useEffect, useState } from "react";

type plotOption = {
  label: string;
  id: string;
}

const plotOptions: plotOption[] = [
  { label: "Scatter plot", id: "scatterplot" },
  { label: "Dot plot", id: "dotplot" },
]

export function PopoverImageSaving(props: {
  trigger: keyof triggerOptions;
  plot: keyof PlotConfigurationData;
}) {
 
  const expression = useAppSelector((state) => state.plotReducer.data.GDE.expression);
  const obsm = useAppSelector((state) => state.plotReducer.anndata.obsm.selectedKey);
  const config = useAppSelector((state) => state.plotReducer.plot[props.plot]);
  const dispatch = useAppDispatch();
  
  const [title, setTitle] = useState("");
  const [scale, setScale] = useState("1");
  const [imageWidth, setImageWidth] = useState("1000");
  const [imageHeight, setImageHeight] = useState("1000");
  const [showLegend, setShowLegend] = useState(true);
  const [showHiddenPoints, setShowHiddenPoints] = useState(true);
  
  const [titleError, setTitleError] = useState(false);
  const [scaleError, setScaleError] = useState(false);
  const [widthError, setWidthError] = useState(false);
  const [heightError, setHeightError] = useState(false);
  
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover-savedotplot" : undefined;
  let filteredOptions = plotOptions
  
  if (!expression || expression.length == 0) {
    filteredOptions = filteredOptions.filter((e) => e.id !== "dotplot")
  }
  
  if (!obsm) {
    filteredOptions = filteredOptions.filter((e) => e.id !== "scatterplot")
  }
  
  useEffect(() => {
    if (open && title === "") {
      setTitle("plot_" + props.plot + "_" + (new Date().toISOString().split('T')[0]))
    }
  }, [anchorEl]);
  
  return (
    <>
      <IconButton
        size="small"
        disabled={(!expression || expression.length == 0) && !obsm}
        onClick={handleClick}
        aria-describedby={id}
        sx={{
          p: 0,
          minHeight: 0,
          minWidth: 0,
        }}
      >
        <Save />
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
        <Stack direction="column">
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
              label="Image title"
              value={title}
              error={titleError}
              onChange={(event) => {
                setTitle(event.target.value);
              }}
            />
            <Stack direction="row" columnGap={1}>
              <TextField
                variant="outlined"
                size="small"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                label="image width"
                value={imageWidth}
                error={widthError}
                onChange={(event) => {
                  setImageWidth(event.target.value);
                }}
              />
              <TextField
                variant="outlined"
                size="small"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                label="image height"
                value={imageHeight}
                error={heightError}
                onChange={(event) => {
                  setImageHeight(event.target.value);
                }}
              />
            </Stack>
            <TextField
              variant="outlined"
              size="small"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              label="point scale factor"
              value={scale}
              error={scaleError}
              onChange={(event) => {
                setScale(event.target.value);
              }}
            />
            <Tooltip
              enterDelay={0}
              placement="bottom"
              title="Save current dotplot to image"
            >
              <Button
                variant="contained"
                onClick={async () => {
                  const parsedScale = parseInt(scale) ?? null;
                  const parsedWidth = parseInt(imageWidth) ?? null;
                  const parsedHeight = parseInt(imageHeight) ?? null;

                  const isErrorWidth = !parsedWidth || (parsedWidth > 10000) || (parsedWidth <= 0);
                  const isErrorHeight = !parsedHeight || (parsedHeight > 10000) || (parsedHeight <= 0);
                  const isErrorScale = !parsedScale;
                  
                  setTitleError(title === "");
                  setWidthError(isErrorWidth);
                  setHeightError(isErrorHeight);
                  setScaleError(isErrorScale);

                  if (
                    isErrorWidth ||
                    isErrorHeight ||
                    isErrorScale ||
                    title === ""
                  ) {
                    return;
                  }

                  dispatch(
                    setPlotConfigField({
                      plot: props.plot,
                      config: {
                        ...config,
                        showLegend: showLegend,
                        showHiddenPoints: showHiddenPoints,
                        width: parsedWidth,
                        height: parsedHeight,
                        scale: parsedScale,
                      },
                    })
                  );

                  dispatch(setTrigger({ type: props.trigger, value: title }));
                }}
              >
                Create Image
              </Button>
            </Tooltip>
          </Stack>

          <Stack direction="row" alignItems="center">
            <Checkbox
              size="small"
              sx={{
                p: 1,
              }}
              checked={showLegend}
              onChange={() => setShowLegend(!showLegend)}
            />
            <Typography>include legend</Typography>
          </Stack>
          
          <Stack direction="row" alignItems="center">
            <Checkbox
              size="small"
              sx={{
                p: 1,
              }}
              checked={showHiddenPoints}
              onChange={() => setShowHiddenPoints(!showHiddenPoints)}
            />
            <Typography>include hidden points</Typography>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
  
}