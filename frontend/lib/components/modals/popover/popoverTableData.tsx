
import { theme } from "@/lib/design";
import { useAppSelector } from "@/lib/redux/hooks/hooks";
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
  
  const selected = useAppSelector((state) => state.plotReducer.data.GDE.selected);
  const statusRGG = useAppSelector((state) => state.plotReducer.status.DGE);
  
  const isSelected = selected === props.title;
  
  return (
    <Tooltip title={props.title} placement="right">
      <span>
        <Button
          fullWidth
          disabled={isSelected || statusRGG.inProgress}
          sx={{
            backgroundColor: isSelected ? theme.palette.action.selected : "",
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
      </span>
    </Tooltip>
  );
}
