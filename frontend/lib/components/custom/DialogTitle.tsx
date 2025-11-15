import { theme } from "@/lib/design";
import { Help } from "@mui/icons-material";
import { Stack, Tooltip, Typography } from "@mui/material";

export default function DialogTitleHelp(props: {
  title: string;
  tooltip: string;
}) {
  
  return (
    <Stack
      direction="row"
      alignContent="center"
      justifyContent="center"
      gap={1}
    >
      <Typography
        sx={{
          // border: "1px solid red",
          textAlign: "center",
          alignContent: "center",
          fontWeight: "bold",
          fontSize: theme.typography.fontSize * 1.2,
        }}
      >
        {props.title}
      </Typography>

      <Tooltip
        // sx={{ border: "1px solid red" }}
        title={props.tooltip}
        placement="right"
      >
        <Help fontSize="small" color="action" />
      </Tooltip>
    </Stack>
  );
  
}