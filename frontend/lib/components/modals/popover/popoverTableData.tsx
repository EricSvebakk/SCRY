
import { theme } from "@/app/layout";
import {
  Button,
  Tooltip,
} from "@mui/material";
import { MouseEvent } from "react";

export function PopoverTableData(props: {
  title: string;
  params: Record<string, unknown>;
  onOpen: (e: MouseEvent<HTMLElement>, title: string) => void;
}) {
  return (
    <Tooltip title={props.title} placement="right">
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
        onClick={(e) => props.onOpen(e, props.title)}
      >
        {props.title}
      </Button>
    </Tooltip>
  );
}
