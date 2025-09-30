
import { theme } from "@/app/layout";
import { useAppSelector } from "@/lib/redux/hooks/hooks";
import { errorAttributes, statusBackendAPI } from "@/lib/types";
import { Notifications } from "@mui/icons-material";
import { Badge, Button, Dialog, DialogContent, DialogTitle, Stack, SxProps, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { useState } from "react";

export function NotificationPopover(props: {
  sx?: SxProps
}) {
 
  const status = useAppSelector((state) => state.plotReducer.statusBackend);
  const error = useAppSelector((state) => state.plotReducer.error);
  
  const statusActive = Object.keys(status).filter((e) => status[e as keyof statusBackendAPI].inProgress);
  const errorActive = Object.keys(error).filter((e) => error[e as keyof errorAttributes].time !== undefined);
  
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
          setOpen(!open)
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
          <Badge badgeContent={statusActive.length + errorActive.length} color={ errorActive.length > 0 ? "warning" : "info" }>
            <Notifications />
          </Badge>
          <Typography
            fontSize={theme.typography.subtitle1.fontSize}
          >
            View tasks
          </Typography>
        </Stack>
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
          <Typography
            // variant="h6"
            // fontSize={theme.typography.subtitle1.fontSize}
          >
            View tasks
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 1 }}>
          
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
                      <TableCell
                        key={`error_table_body_row_${i}_message`}
                        sx={{
                          ...cellProps,
                          maxWidth: 250,
                        }}
                      >
                        <Tooltip
                          enterDelay={0}
                          placement="right"
                          title={error[e as keyof errorAttributes].message}
                        >
                          <Typography
                            key={`error_table_body_row_${i}_message_text`}
                            // noWrap
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "block"
                            }}
                          >
                            {error[e as keyof errorAttributes].message}
                          </Typography>
                        </Tooltip>
                      </TableCell>
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
        </DialogContent>
      </Dialog>
    </>
  );
  
}