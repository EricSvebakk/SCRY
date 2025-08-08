
import { theme } from "@/app/layout";
import {
  Button,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { MouseEvent } from "react";

export function PopoverTableData(props: {
  title: string;
  params: Object;
  anchorEl: HTMLButtonElement | null;
  handleClick: (event: MouseEvent<HTMLButtonElement>) => void;
  handleClose: () => void;
}) {
  
  const open = Boolean(props.anchorEl);
  const id = open ? "simple-popover-table-data" : undefined;

  console.log(props.params)
  
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
          width={280}
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
            {props.params ? (
              Object.entries(props.params).map((e, i) => (
                <Stack
                  key={"table_data_param" + i}
                  direction="row"
                  justifyContent="space-between"
                  width="100%"
                >
                  <Typography key={"table_data_param" + i + "_key"}>
                    {e[0]}
                  </Typography>
                  <Typography key={"table_data_param" + i + "_value"}>
                    {e[1] === null ? "W.I.P" : e[1]}
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
