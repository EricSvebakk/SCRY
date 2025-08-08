
import { theme } from "@/app/layout";
import {
  Button,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { MouseEvent } from "react";

export function PopoverConnectivities(props: {
  title: string;
  connectivityParams: Object;
  anchorEl: HTMLButtonElement | null;
  handleClick: (event: MouseEvent<HTMLButtonElement>) => void;
  handleClose: () => void;
}) {
  
  const open = Boolean(props.anchorEl);
  const id = open ? "simple-popover-dotplotconfig" : undefined;

  return (
    <>
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
          width={200}
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
          >
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Typography>connectivity</Typography>
              <Typography>{props.title}</Typography>
            </Stack>
            {props.connectivityParams ? (
              Object.entries(props.connectivityParams).map((e, i) => (
                <Stack
                  key={"connectivity_param_" + i}
                  direction="row"
                  justifyContent="space-between"
                  width="100%"
                >
                  <Typography key={"connectivity_param_" + i + "_key"}>
                    {e[0]}
                  </Typography>
                  <Typography key={"connectivity_param_" + i + "_value"}>
                    {e[1]}
                  </Typography>
                </Stack>
              ))
            ) : (
              <></>
            )}
          </Stack>
        </Stack>
      </Popover>
    </>
  );
}
