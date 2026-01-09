

import { Box, Collapse, Stack } from "@mui/material";
import React, { useRef } from "react";
import { theme } from "@/lib/design";

export default function PanelMerging(props: {
  open: boolean;
  setOpen: Function;
}) {
  
  const ref = useRef();
  
  return (
    <Collapse
      unmountOnExit
      ref={ref}
      in={props.open}
      orientation="horizontal"
      sx={{
        position: "absolute",
        right: 85,
        top: 0,
        height: "100%",
        zIndex: 500,
      }}
    >
      <Box
        sx={{
          width: 300,
          height: "100vh",
          p: "1vh",
          borderLeft: "1px solid grey",
          backgroundColor: theme.palette.primary.main,
          WebkitBoxShadow: "-1px 0 2px -1px #000000",
          boxShadow: "-1px 0 2px -1px #000000",
        }}
      >
        <Stack
          direction="column"
          rowGap={1}
          sx={{
            pt: 4,
            p: 1,
            height: "96vh",
            backgroundColor: theme.palette.background.paper,
            border: "1px solid grey"
          }}
        >
          
        </Stack>

      </Box>
    </Collapse>
  );
  
}