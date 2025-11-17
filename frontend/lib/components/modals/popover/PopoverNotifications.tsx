
import { theme } from "@/lib/design";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { setError } from "@/lib/redux/reducers/plotReducer";
import { endpoints, errorType, statusType } from "@/lib/types";
import { Close, Notifications } from "@mui/icons-material";
import { Badge, Button, Dialog, DialogContent, IconButton, Stack, SxProps, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { useState } from "react";

export function PopoverNotifications(props: {
  sx?: SxProps
}) {
 
  const status = useAppSelector((state) => state.plotReducer.status);
  const error = useAppSelector((state) => state.plotReducer.error);
  
  const dispatch = useAppDispatch();
  
  const statusActive = Object.keys(status).filter((e) => status[e as keyof statusType].inProgress);
  const errorActive = Object.keys(error).filter((e) => error[e as keyof errorType].time !== undefined);
  
  const [open, setOpen] = useState<boolean>(false);
  
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
        onClick={() => {
          setOpen(!open);
        }}
        // aria-describedby={id}
      >
        <Stack
          direction="column"
          sx={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Badge
            badgeContent={statusActive.length + errorActive.length}
            color={errorActive.length > 0 ? "warning" : "info"}
          >
            <Notifications />
          </Badge>
          <Typography fontSize={theme.typography.subtitle1.fontSize}>
            View tasks
          </Typography>
        </Stack>
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        {/* <DialogTitle>
          <Typography
            // variant="h6"
            // fontSize={theme.typography.subtitle1.fontSize}
          >
            View tasks
          </Typography>
        </DialogTitle> */}
        <DialogContent sx={{ p: 1 }}>
          <Stack direction="column" height={200} p={1} gap={1.5}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      ...cellProps,
                      fontWeight: "bold",
                      minWidth: 60,
                      maxWidth: 60,
                      width: 60,
                      // border: "1px solid red"
                    }}
                  >
                    Time
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellProps,
                      fontWeight: "bold",
                      minWidth: 100,
                      maxWidth: 100,
                      width: 100,
                      // border: "1px solid red"
                    }}
                  >
                    Task
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellProps,
                      fontWeight: "bold",
                      minWidth: 280,
                      maxWidth: 280,
                      width: 280,
                      // border: "1px solid red"
                    }}
                  >
                    Message
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellProps,
                      minWidth: 40,
                      maxWidth: 40,
                      width: 40,
                    }}
                  ></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {errorActive.map((e, i) => {
                  return (
                    <TableRow key={`error_table_body_row_${i}`}>
                      <TableCell
                        key={`error_table_body_row_${i}_timestamp`}
                        sx={cellProps}
                      >
                        <Typography
                          key={`error_table_body_row_${i}_timestamp_text`}
                        ></Typography>
                      </TableCell>
                      
                      <TableCell
                        key={`error_table_body_row_${i}_task`}
                        sx={cellProps}
                      >
                        <Typography
                          key={`error_table_body_row_${i}_task_text`}
                          sx={{
                            color: "red",
                          }}
                        >
                          {e}
                        </Typography>
                      </TableCell>


                      <TableCell
                        key={`error_table_body_row_${i}_message`}
                        sx={{
                          ...cellProps,
                          minWidth: 250,
                          maxWidth: 250,
                        }}
                      >
                        <Tooltip
                          enterDelay={0}
                          placement="right"
                          title={error[e as keyof errorType].message}
                        >
                          <Typography
                            key={`error_table_body_row_${i}_message_text`}
                            // noWrap
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "block",
                            }}
                          >
                            {error[e as keyof errorType].message}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      <TableCell
                        key={`error_table_body_row_${i}_close`}
                        sx={cellProps}
                      >
                        <IconButton
                          size="small"
                          key={`error_table_body_row_${i}_close_button`}
                          onClick={() => {
                            dispatch(
                              setError({
                                type: e,
                                message: "",
                                time: undefined
                              })
                            );
                          }}
                        >
                          <Close />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {statusActive.map((e, i) => {
                  return (
                    <TableRow key={`notification_table_body_row_${i}`}>
                      <TableCell
                        key={`notification_table_body_row_${i}_timestamp`}
                        sx={cellProps}
                      >
                        <Typography
                          key={`notification_table_body_row_${i}_timestamp`}
                        >
                          {status[e as keyof statusType].timestamp}
                        </Typography>
                      </TableCell>

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
                        sx={{
                          ...cellProps,
                          minWidth: 250,
                          maxWidth: 250,
                        }}
                      >
                        <Typography
                          key={`notification_table_body_row_${i}_message_text`}
                        >
                          {status[e as keyof statusType].message}
                        </Typography>
                      </TableCell>

                      <TableCell
                        key={`notification_table_body_row_${i}_close`}
                        sx={cellProps}
                      >
                        {/* <Typography
                          key={`notification_table_body_row_${i}_close_text`}
                        >
                          x
                        </Typography> */}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
  
}