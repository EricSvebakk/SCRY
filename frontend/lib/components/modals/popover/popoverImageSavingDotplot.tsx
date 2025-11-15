

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { Close, Save } from "@mui/icons-material";
import { Button, IconButton, Popover, Stack, TextField, Tooltip } from "@mui/material";
import { MouseEvent, useEffect, useState } from "react";
import d3ToPng from "d3-svg-to-png";

type plotOption = {
  label: string;
  id: string;
}

const plotOptions: plotOption[] = [
  { label: "Scatter plot", id: "scatterplot" },
  { label: "Dot plot", id: "dotplot" },
]

export function PopoverImageSavingDotplot() {
 
  const expression = useAppSelector((state) => state.plotReducer.data.GDE.expression);
  const obsm = useAppSelector((state) => state.plotReducer.anndata.obsm.selectedKey);
  const dispatch = useAppDispatch();
  
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
  
  if (!expression || expression.length == 0) {
    filteredOptions = filteredOptions.filter((e) => e.id !== "dotplot")
  }
  
  if (!obsm) {
    filteredOptions = filteredOptions.filter((e) => e.id !== "scatterplot")
  }
  
  useEffect(() => {
    if (open && title === "") {
      setTitle("plot_" + (new Date().toISOString().split('T')[0]))
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
        <Stack
          direction="column"
          width={300}
          height="fit-content"
          p={1}
          gap={1.5}
        >
          <Stack direction="row" justifyContent="end" width="100%">
            <IconButton
              size="small"
              onClick={() => handleClose()}
            >
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

                setScaleError(!parsedScale);
                setTitleError(title === "");

                if (!parsedScale || title === "") {
                  return;
                }
                
                d3ToPng("#dotplot", title, {
                  cssinline: 0,
                  format: "png",
                  download: true,
                  background: "white",
                  scale: parsedScale,
                });
                
                // dispatch(setPlotConfigField({
                //   plot: props.plot,
                //   config: {
                //     ...config,
                //     scale: parsedScale
                //   }
                // }))

                // dispatch(
                //   setTrigger({ type: props.trigger, value: title })
                // );
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