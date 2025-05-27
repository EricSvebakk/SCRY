
import {
  Checkbox,
  Stack,
  Typography,
} from "@mui/material";
import { useAppSelector } from "../redux/hooks/hooks";
import { RootState } from "../redux/stores/store";
import { Square } from "@mui/icons-material";

export function LabelListItem(props:{
  label: string,
  label_color: string
}) {
  
  const labelSize = useAppSelector((state: RootState) => state.plotReducer.labelSize);
  const selectedLabels = useAppSelector((state) => state.plotReducer.selectedLabels);
  
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
    >
      <Stack
        key={"label_stack" + props.label}
        direction="row"
        alignItems="center"
        justifyContent="left"
      >
        <Square
          key={"label_square" + props.label}
          sx={{
            width: 22,
            height: 22,
            marginRight: 1,
            color: props.label_color,
          }}
        />
        <Typography
          key={"label_typography" + props.label}
          variant="subtitle2"
          color={props.label_color}
        >
          {props.label}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
      >
        <Typography
          key={"label_typography" + props.label}
          variant="subtitle2"
          color={props.label_color}
        >
          {labelSize[props.label]
            ? ` (${labelSize[props.label].toLocaleString(
                undefined,
                { minimumIntegerDigits: 3 }
              )})`
            : ""}
        </Typography>
        <Checkbox
          size="small"
          checked={selectedLabels.includes(props.label)}
        />
      </Stack>
    </Stack>
  )
  
}