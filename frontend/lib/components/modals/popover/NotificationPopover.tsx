
import { theme } from "@/app/layout";
import { useAppSelector } from "@/lib/redux/hooks/hooks";
import { errorAttributes, statusBackendAPI } from "@/lib/types";
import { Notifications } from "@mui/icons-material";
import { Badge, Button, Popover, Stack, SxProps, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { MouseEvent, useState } from "react";

export function NotificationPopover(props: {
  sx?: SxProps
}) {
 
  const status = useAppSelector((state) => state.plotReducer.statusBackend);
  const error = useAppSelector((state) => state.plotReducer.error);
  
  const statusActive = Object.keys(status).filter((e) => status[e as keyof statusBackendAPI].inProgress);
  const errorActive = Object.keys(error).filter((e) => error[e as keyof errorAttributes].time !== undefined);
  
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover-savedotplot" : undefined;
  
  const cellProps: SxProps = {
    p: 1
  }
  
  return (
    <>
      <Button
        fullWidth
        sx={{
          ...props.sx,
          // border: "1px solid grey",
        }}
        onClick={handleClick}
        aria-describedby={id}
      >
        <Stack
          direction="column"
          sx={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Badge badgeContent={statusActive.length + errorActive.length} color={ errorActive.length > 0 ? "warning" : "info" }>
            <Notifications />
          </Badge>
          <Typography
            fontSize={theme.typography.subtitle1.fontSize}
          >
            Tasks
          </Typography>
        </Stack>
      </Button>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Stack
          direction="column"
          width={400}
          height={200}
          p={1}
          gap={1.5}
          >

          
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    ...cellProps,
                    fontWeight: "bold"
                  }}
                >
                  Task
                </TableCell>
                <TableCell
                  sx={{
                    ...cellProps,
                    fontWeight: "bold"
                  }}
                  
                >
                  Message
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {errorActive.map((e, i) => {
                return (
                  <TableRow
                    key={`error_table_body_row_${i}`}
                  >
                    <TableCell
                      key={`error_table_body_row_${i}_task`}
                      sx={cellProps}
                      >
                      <Typography
                        key={`error_table_body_row_${i}_task_text`}
                        sx={{
                          color: "red"
                        }}
                      >
                        {e}
                      </Typography>
                    </TableCell>
                    <Tooltip enterDelay={0} placement="right" title={error[e as keyof errorAttributes].message}>
                      <TableCell
                        key={`error_table_body_row_${i}_message`}
                        sx={cellProps}
                        >
                        <Typography
                          key={`error_table_body_row_${i}_message_text`}
                          noWrap
                          textOverflow="ellipsis"
                          overflow="clip"
                        >
                          {error[e as keyof errorAttributes].message}
                        </Typography>
                      </TableCell>
                    </Tooltip>
                  </TableRow>
                )
              })}
              {statusActive.map((e, i) => {
                return (
                  <TableRow
                    key={`notification_table_body_row_${i}`}
                  >
                    <TableCell
                      key={`notification_table_body_row_${i}_task`}
                      sx={cellProps}
                      >
                      <Typography
                        key={`notification_table_body_row_${i}_task_text`}
                      >
                        {e}
                      </Typography>
                    </TableCell>
                    <TableCell
                      key={`notification_table_body_row_${i}_message`}
                      sx={cellProps}
                      >
                      <Typography
                        key={`notification_table_body_row_${i}_message_text`}
                      >
                        {status[e as keyof statusBackendAPI].message}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
              
          </Table>

        </Stack>
      </Popover>
    </>
  );
  
}