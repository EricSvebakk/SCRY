import { theme } from "@/lib/design";
import { useAppSelector } from "@/lib/redux/hooks/hooks";
import { Box, Link, Stack, Typography } from "@mui/material";

export default function GeneSummary() {
  
  const report = useAppSelector((state) => state.plotReducer.data.geneReport);  
  
  return (
    <Stack
      direction="column"
      sx={{
        backgroundColor: theme.palette.background.paper,
        border: "1px solid grey",
        height: "100%",
        p: 1,
      }}
    >
      <Stack
        direction="row"
        sx={{
          width: "100%",
          justifyContent: "end",
        }}
      >
        <Typography variant="caption">Gene Summary</Typography>
      </Stack>

      {report ? (
        <Stack
          direction="column"
          sx={{
            height: "100%",
          }}
        >
          <Stack
            direction="column"
            rowGap={1}
            sx={{
              height: "100%",
            }}
          >
            <Typography
              sx={{
                fontWeight: "bold",
              }}
            >
              {report.symbol}
            </Typography>

            <Typography
              sx={{
                fontStyle: "italic",
              }}
              variant="body2"
            >
              {report.description}
            </Typography>

            {report.summary.map((e, i) => {
              return (
                <Typography key={"report_summary_" + i} variant="body2">
                  {e}
                </Typography>
              );
            })}
            <Stack direction="column" rowGap={0}>
              <Typography variant="body2">Synonyms</Typography>
              <Typography variant="body2">
                [{report.synonyms.join(", ")}]
              </Typography>
            </Stack>
          </Stack>

          <Stack
            direction="row"
            sx={{
              width: "100%",
              justifyContent: "end",
            }}
          >
            <Link
              href={report.source}
              underline="hover"
              variant="body2"
              target="_blank"
              rel="noopener noreferrer"
            >
              [Source]
            </Link>
          </Stack>
        </Stack>
      ) : (
        <Box
          sx={{
            height: "100%",
            width: "100%",
            alignContent: "center",
            justifyItems: "center",
          }}
        >
          <Typography variant="body2">No gene selected</Typography>
        </Box>
      )}
    </Stack>
  );
  
}