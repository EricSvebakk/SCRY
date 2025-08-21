
import { Box, Button, Collapse, Grid, Stack, SxProps, Typography } from "@mui/material";
import React, { useRef, useState } from "react";
import { theme } from "@/app/layout";
import { GroupWork, Height } from "@mui/icons-material";


export default function NavbarRight(props: {
}) {
  
  const [open, setOpen] = useState(false);
  
  const navItemProps = (isOpen: boolean, index: number | null = null) => {
    return {
      color: theme.palette.text.secondary,
      backgroundColor: isOpen
        ? theme.palette.primary.main
        : theme.palette.secondary.main,
      height: "100%",
      fontWeight: "bold",
      borderRadius: "0",
      "&:hover": {
        backgroundColor: "#aaa",
      },
      borderTop: isOpen && index && index !== 0 ? "1px solid grey" : "none",
      borderBottom: isOpen ? "1px solid grey" : "none",
      borderLeft: isOpen ? "none" : "1px solid grey",
    } as SxProps;
  };
  
  const ref = useRef();
  
  return (
    <Box
      // direction="row"
      height="100%"
    >
      <Collapse
        unmountOnExit
        ref={ref}
        in={open}
        orientation="horizontal"
        sx={{
          position: "absolute",
          right: 85,
          top: 0,
          height: "100%",
          zIndex: 500
        }}
      >
        <Stack
          direction="column"
          height="100%"
          width={300}
          sx={{
            // p: 1,
            borderLeft: "1px solid grey",
            backgroundColor: "white",
            // boxShadow: 2
            WebkitBoxShadow: "-1px 0 2px -1px #000000",
            boxShadow: "-1px 0 2px -1px #000000",
          }}
        >
          <Box
            sx={{
              p: 1,
              backgroundColor: theme.palette.secondary.main,
              height: theme.typography.fontSize,
              borderBottom: "1px solid grey"
            }}
          />
          
          <Stack
            direction="column"
            sx={{
              p: 1
            }}
          >
            <Typography>Please select a gene from the DE dotplot.</Typography>
          </Stack>
          
          
          {/* <Button
            fullWidth
            sx={navItemProps(false)}
            onClick={() => {
              setOpen(!open);
            }}
          >
            hello
          </Button> */}
        </Stack>

      </Collapse>

      <Grid
        item
        container
        direction="column"
        height="100%"
        overflow="clip"
        sx={{
          zIndex: 1200
        }}
      >
        <Grid item height={70}>
          <Button
            fullWidth
            sx={navItemProps(false)}
            onClick={() => {
              setOpen(!open);
            }}
          >
            <Stack
              direction="column"
              sx={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {<GroupWork />}
              <Typography fontSize={theme.typography.subtitle1.fontSize}>
                Gene view
              </Typography>
            </Stack>
          </Button>
        </Grid>

        <Grid
          item
          xs
          sx={{
            height: "100%",
            width: "100%",
            borderLeft: "1px solid grey",
            backgroundColor: theme.palette.secondary.main,
          }}
        />
      </Grid>
    </Box>
  );
  
}