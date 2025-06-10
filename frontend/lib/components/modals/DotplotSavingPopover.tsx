import { useAppSelector } from "@/lib/redux/hooks/hooks";
import { Close, Save } from "@mui/icons-material";
import { Button, IconButton, Popover, Stack, TextField, Tooltip } from "@mui/material";
import d3ToPng from "d3-svg-to-png";
import { MouseEvent, useEffect, useState } from "react";

export function DotplotSavingPopover() {
 
  const unsTitle = useAppSelector((state) => state.plotReducer.dotplotOptions.title)
  const expression = useAppSelector((state) => state.plotReducer.geneExpression);
  
  const [title, setTitle] = useState(unsTitle + "_dotplot");
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
  
  useEffect(() => {
    setTitle(unsTitle + "_dotplot")
  }, [unsTitle])
  
  return (
    <>
      <IconButton
        disabled={expression.length == 0}
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
          width={200}
          height="fit-content"
          p={1}
          gap={1}
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
                
                if ((!!parsedScale) && (title !== "")) {                
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