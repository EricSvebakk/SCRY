import { ListTextProps, theme } from "@/lib/design";
import { Box, Button, CircularProgress, Stack, Tooltip, Typography } from "@mui/material";
import CurrentProgress from "../OverlayCurrentProgress";
import { statusOptions } from "@/lib/types";
import { MouseEvent } from "react";

export default function ButtonList(props: {
  items: string[] | undefined;
  selectedItem: string | undefined;
  statusIncoming: statusOptions;
  statusOutgoing: statusOptions;
  placeholder: string;
  onClick: (item: string, elem?: MouseEvent<HTMLElement>) => void;
}) {
  
  const {
    items,
    selectedItem,
    statusIncoming,
    statusOutgoing,
    placeholder,
    onClick,
  } = props;

  return (
    <Stack
      direction="column"
      sx={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {items && !statusIncoming.inProgress ? (
        items.length > 0 ? (
          [...items]
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .map((item, i) => {
              const isSelected = selectedItem === item;
              return (
                <Tooltip
                  key={`button_list_${item}_tooltip`}
                  title={item}
                  placement="right"
                >
                  <span key={`button_list_${item}_tooltip_span`}>
                    <Button
                      key={`button_list_${item}_button`}
                      size="small"
                      variant="text"
                      disabled={isSelected || statusOutgoing.inProgress}
                      tabIndex={300 + i}
                      sx={{
                        ...ListTextProps,
                        fontWeight: isSelected ? "bold" : "",
                        backgroundColor: isSelected
                          ? theme.palette.action.selected
                          : "",
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                      onClick={(me) => onClick(item, me)}
                    >
                      <Stack
                        key={`button_list_${item}_button_stack`}
                        direction="row"
                        sx={{
                          p: 0.3,
                          width: "100%",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          key={`button_list_${item}_button_text`}
                          sx={{
                            ...ListTextProps,
                            fontWeight: isSelected ? "bold" : "",
                            color: isSelected
                              ? theme.palette.action.disabled
                              : "",
                          }}
                        >
                          {item}
                        </Typography>

                        {statusOutgoing.inProgress && isSelected ? (
                          <CircularProgress
                            key={`button_list_${item}_button_circle`}
                            size={16}
                            color="primary"
                          />
                        ) : (
                          <></>
                        )}
                      </Stack>
                    </Button>
                  </span>
                </Tooltip>
              );
            })
        ) : (
          <Box
            sx={{
              height: "100%",
              width: "100%",
              alignContent: "center",
              justifyItems: "center",
            }}
          >
            <Typography
              sx={{
                ...ListTextProps,
                textAlign: "center"
              }}
            >
              {placeholder}
            </Typography>
          </Box>
        )
      ) : (
        <Box
          sx={{
            height: "100%",
            width: "100%",
            alignContent: "center",
            justifyItems: "center",
          }}
        >
          <CurrentProgress status={statusIncoming} />
        </Box>
      )}
    </Stack>
  );
}
