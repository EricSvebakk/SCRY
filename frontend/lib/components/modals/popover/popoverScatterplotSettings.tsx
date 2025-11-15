

import { sequentialScaleColorOptions } from "@/lib/design";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { setPlotConfigField } from "@/lib/redux/reducers/plotReducer";
import { Close, Settings } from "@mui/icons-material";
import { Autocomplete, Button, IconButton, Popover, Stack, TextField, Tooltip } from "@mui/material";
import { MouseEvent, useState } from "react";

type plotOption = {
  label: string;
  id: number;
}

export function PopoverScatterplotSettings() {
 
  const config = useAppSelector((state) => state.plotReducer.plot.cluster);
  const obsm = useAppSelector((state) => state.plotReducer.anndata.obsm.selectedKey);
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs.selectedKey);
  
  const dispatch = useAppDispatch();
  
  const [colorOptions, setColorOptions] = useState<plotOption[]>(Object.keys(sequentialScaleColorOptions).map((e, i) => ({ id: i, label: e })));
  const [selectedColorOption, setSelectedColorOption] = useState<plotOption | null>(colorOptions[colorOptions.findIndex((e) => e.label == config.palette)])
  
  const [backgroundOptions, setBackgroundOptions] = useState<plotOption[]>(["black", "white"].map((e, i) => ({ id: i, label: e })));
  const [selectedBackground, setSelectedBackground] = useState<plotOption | null>((backgroundOptions[backgroundOptions.findIndex((e) => e.label == config.background)]))
  
  
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover-savedotplot" : undefined;
  
  return (
    <>
      <IconButton
        size="small"
        disabled={!obsm || !obs}
        onClick={handleClick}
        aria-describedby={id}
        sx={{
          p: 0,
          minHeight: 0,
          minWidth: 0,
          // display: "inline-block",
        }}
      >
        <Settings />
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

          <Autocomplete
            value={selectedColorOption}
            options={colorOptions}
            onChange={(event: any, value: any, reason, details) => {
              if (reason === "selectOption") {
                setSelectedColorOption(details?.option as any);
              } else if (reason === "removeOption" || reason === "clear") {
                setSelectedColorOption(null);
              }
            }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  size="small"
                  label="Color Palette"
                  placeholder="color palette"
                  InputLabelProps={{ shrink: true }}
                />
              );
            }}
          />

          <Autocomplete
            value={selectedBackground}
            options={backgroundOptions}
            onChange={(event: any, value: any, reason, details) => {
              if (reason === "selectOption") {
                setSelectedBackground(details?.option as any);
              } else if (reason === "removeOption" || reason === "clear") {
                setSelectedBackground(null);
              }
            }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  size="small"
                  label="Background Color"
                  placeholder="background color"
                  InputLabelProps={{ shrink: true }}
                />
              );
            }}
          />

          <Tooltip
            enterDelay={0}
            placement="bottom"
            title="Updates the scatter plot with the selected settings"
          >
            <Button
              variant="contained"
              onClick={() => {
                if (selectedColorOption) {
                  dispatch(
                    setPlotConfigField({
                      plot: "cluster",
                      config: {
                        ...config,
                        background: selectedBackground?.label,
                        palette: selectedColorOption?.label,
                      },
                    })
                  );
                }
              }}
            >
              Update
            </Button>
          </Tooltip>
        </Stack>
      </Popover>
    </>
  );
  
}