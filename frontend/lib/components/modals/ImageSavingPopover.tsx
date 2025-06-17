import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { setTrigger } from "@/lib/redux/reducers/plotReducer";
import { Close, Save } from "@mui/icons-material";
import { Autocomplete, Button, IconButton, Popover, Stack, TextField, Tooltip } from "@mui/material";
import d3ToPng from "d3-svg-to-png";
import { MouseEvent, useState } from "react";

type plotOption = {
  label: string;
  id: string;
}

const plotOptions: plotOption[] = [
  { label: "Scatter plot", id: "scatterplot" },
  { label: "Dot plot", id: "dotplot" },
]

export function ImageSavingPopover() {
 
  const unsTitle = useAppSelector((state) => state.plotReducer.dotplotOptions.title)
  const expression = useAppSelector((state) => state.plotReducer.geneExpression);
  const obsm = useAppSelector((state) => state.plotReducer.obsm);
  const dispatch = useAppDispatch();
  
  const [selectedPlot, setSelectedPlot] = useState<plotOption | null>(null);
  
  const [title, setTitle] = useState("");
  const [scale, setScale] = useState("1");
  const [titleError, setTitleError] = useState(false);
  const [scaleError, setScaleError] = useState(false);
  
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
  
  if (expression.length == 0) {
    filteredOptions = filteredOptions.filter((e) => e.id !== "dotplot")
  }
  
  if (!obsm) {
    filteredOptions = filteredOptions.filter((e) => e.id !== "scatterplot")
  }
  
  return (
    <>
      <IconButton
        disabled={(expression.length == 0) && !obsm}
        onClick={handleClick}
        aria-describedby={id}
        size="small"
      >
        <Save/>
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
          <Stack
            direction="row"
            justifyContent="end"
            width="100%"
          >
            <IconButton
              size="small"
              onClick={() => handleClose()}
            >
              <Close />
            </IconButton>
          </Stack>
          
          <Autocomplete
            value={selectedPlot}
            options={filteredOptions}
            onChange={(event: any, value: any, reason, details) => {              
              if (reason === "selectOption") {
                setSelectedPlot(details?.option as any)
              } else if ((reason === "removeOption") || reason === "clear") {
                setSelectedPlot(null)
              }
            }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  size="small"
                  label="Select plot"
                  placeholder="plot"
                  InputLabelProps={{ shrink: true }}
                />
              );
            }}
          />
          
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
              setTitle(event.target.value)
            }}
          />
          <TextField
            variant="outlined"
            size="small"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            label="scale factor"
            value={scale}
            error={scaleError}
            onChange={(event) => {
              setScale(event.target.value)
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
                
                setScaleError(!parsedScale);
                setTitleError(title === "");
                
                if ((!parsedScale) || (title === "")) {
                  return;
                }
                
                if (selectedPlot?.id === "scatterplot") {
                  dispatch(setTrigger({ type: "saveScatterPlotImage", value: title }));
                }
                else if (selectedPlot?.id === "dotplot") {
                  d3ToPng("#dotplot", title, {
                    scale: parsedScale,
                    format: "png",
                    cssinline: 0,
                    download: true,
                    background: "white"
                  })
                }
                
              }}
            >
              Create Image
            </Button>
          </Tooltip>
        </Stack>
      </Popover>
    </>
  );
  
}