
import { CircularProgress, Stack, Typography } from "@mui/material";
import { statusOptions } from "../types";

type CurrentProgressProps = {
  status: statusOptions;
  indicatorSize?: number;
}

export default function CurrentProgress({ 
  status,
  indicatorSize = 60
}: CurrentProgressProps) {
  
  return (
    <Stack
      sx={{
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
      gap={2}
    >
      <Typography>{status.message}</Typography>

      <CircularProgress size={indicatorSize} color="primary" />
    </Stack>
  );
}