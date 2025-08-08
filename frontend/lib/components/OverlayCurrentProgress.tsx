
import { CircularProgress, Stack, Typography } from "@mui/material";
import { statusOptions } from "../types";
import { theme } from "@/app/layout";

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
        backgroundColor: theme.palette.background.paper,
      }}
      gap={2}
    >
      <Typography
        textAlign="center"
        fontSize={theme.typography.fontSize}
      >
        {status.message}
      </Typography>

      <CircularProgress size={indicatorSize} color="primary" />
    </Stack>
  );
}