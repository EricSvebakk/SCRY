import { theme } from "@/app/layout";
import { LoadingButton } from "@mui/lab";
import { SxProps, Theme } from "@mui/material";

type ButtonSecondaryType = {
  title: string;
  onClick: Function;
  sx?: SxProps<Theme>;
  disabled?: boolean;
  loading?: boolean;
}

export default function ButtonSecondary(props: ButtonSecondaryType) {
  
  return (
    <LoadingButton
      fullWidth
      size="small"
      variant="contained"
      color="secondary"
      disabled={props.disabled}
      loading={props.loading}
      sx={{
        height: 30,
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
    </LoadingButton>
  );
  
}