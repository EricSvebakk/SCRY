import { theme } from "@/app/layout";
import { Button, SxProps, Theme } from "@mui/material";

type ButtonSecondaryType = {
  title: string;
  onClick: Function;
  sx?: SxProps<Theme>
}

export default function ButtonSecondary(props: ButtonSecondaryType) {
  
  return (
    <Button
      fullWidth
      size="small"
      variant="contained"
      color="secondary"
      sx={{
        color: theme.palette.text.secondary,
        overflowX: "clip",
        fontWeight: "bold",
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