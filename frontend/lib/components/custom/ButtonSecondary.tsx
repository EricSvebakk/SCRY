import { theme } from "@/app/layout";
import { Button, SxProps, Theme } from "@mui/material";

type ButtonSecondaryType = {
  title: string;
  onClick: Function;
  sx?: SxProps<Theme>;
  disabled?: boolean;
}

export default function ButtonSecondary(props: ButtonSecondaryType) {
  
  return (
    <Button
      fullWidth
      size="small"
      variant="contained"
      color="secondary"
      disabled={props.disabled ? props.disabled : false}
      sx={{
        color: theme.palette.text.secondary,
        overflowX: "clip",
        fontWeight: "bold",
        fontSize: theme.typography.fontSize,
        borderRadius: "0",
        boxShadow: "initial",
        ...props.sx
      }}
      onClick={() => props.onClick()}
    >
      {props.title}
    </Button>
  );
  
}