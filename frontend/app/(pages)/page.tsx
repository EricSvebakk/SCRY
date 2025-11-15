"use client";

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { theme } from "@/lib/design";
import { Close } from "@mui/icons-material";
import { useLazySystemFilesQuery } from "@/lib/redux/api/api";
import CurrentProgress from "@/lib/components/OverlayCurrentProgress";
import formatFileSize from "@/lib/util/formatFileSize";
import crypto from "crypto"
import { LoadingButton } from "@mui/lab";
import { setActiveUser, setPassKey } from "@/lib/redux/reducers/plotReducer";


export default function FileIdPage({}) {
  
  const fileID = useAppSelector((state) => state.plotReducer.system.files.active);  
  const status = useAppSelector((state) => state.plotReducer.statusBackend.systemFiles);
  const filenames = useAppSelector((state) => state.plotReducer.system.files.all);
  
  const [userID, setUserID] = useState("");
  const [pass, setPass] = useState("");
  const [userIDError, setUserIDError] = useState(false);
  const [passError, setPassError] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [getSystemFiles, { isSuccess, isLoading }] = useLazySystemFilesQuery();
  
  // console.log(userIDError, passError)
  
  return (
    <>
      
      <Dialog open={!isSuccess} onClose={() => {}}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
            <Typography
            >
              View files
            </Typography>
            
            <IconButton disabled size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          
          <Stack
            direction="column"
            gap={1.5}
            width={300}
            sx={{
              p: 1
            }}
          >
            <TextField
              variant="outlined"
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
              label="user ID"
              error={userIDError}
              value={userID}
              onChange={(event) => {
                setUserID(event.target.value);
              }}
            />
            
            <TextField
              variant="outlined"
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
              label="passkey"
              error={passError}
              value={pass}
              onChange={(event) => {
                setPass(event.target.value);
              }}
            />
            
            <LoadingButton
              variant="contained"
              loading={isLoading}
              onClick={() => {
                
                setUserIDError(userID === "");
                
                if (userID === "") {
                  return;
                }
                
                const hash = crypto.createHash("sha256").update(pass).digest("hex");
                
                dispatch(setActiveUser(userID));
                dispatch(setPassKey(hash));
                
                // TODO: fix API-headers
                getSystemFiles()
                  .then((data: any) => {
                    if (data.isError) {
                      setPass("");
                      setPassError(true);
                    }
                    else if (data.isSuccess) {
                      localStorage.setItem("user_id", userID);
                      localStorage.setItem("passkey_hash", hash);
                    }
                  });
              }}
            >
              Confirm
            </LoadingButton>
          </Stack>
          
          
        </DialogContent>
      </Dialog>

      <Dialog open={isSuccess} onClose={() => {}}>
        <DialogTitle>
          <Typography
          >
            View files
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          
          <Grid
            container
            direction="column"
            height="100%"
            rowGap={1}
            sx={{
              p: 1,
            }}
          >
            <Grid item>
               {status.inProgress ? (
                 <Box
                   sx={{
                     height: 500,
                   }}
                 >
                   <CurrentProgress status={status}/>
                 </Box>
               ) : (
                 <TableContainer
                   component={Paper}
                   sx={{
                     width: 550,
                     height: 500,
                     borderRadius: 0,
                     border: "1px solid grey",
                     scrollbarWidth: "thin",
                     boxShadow: "none",
                   }}
                 >
                   <Table stickyHeader>
                     <TableHead
                       sx={{
                         borderBottom: "1px solid grey",
                         // width: 50,
                       }}
                     >
                       <TableRow
                         sx={{
                           width: 50,
                         }}
                       >
                         <TableCell
                           sx={{
                             backgroundColor: theme.palette.secondary.main,
                             borderBottom: "1px solid grey",
                             fontWeight: "bold",
                           }}
                         >
                           Filename
                         </TableCell>
                         <TableCell
                           sx={{
                             backgroundColor: theme.palette.secondary.main,
                             borderBottom: "1px solid grey",
                             fontWeight: "bold",
                           }}
                         >
                           Size
                         </TableCell>
                         <TableCell
                           sx={{
                             backgroundColor: theme.palette.secondary.main,
                             borderBottom: "1px solid grey",
                             fontWeight: "bold",
                           }}
                         >
                           Usage
                         </TableCell>
                       </TableRow>
                     </TableHead>
                     <TableBody>
                       {filenames.map((e, i) => {
                         return (
                           <Tooltip key={`file_table_row_${i}_tooltip`} title={e.name} placement="right">
                             <TableRow
                               key={`file_table_row_${i}_row`}
                               selected={e.id === selectedFile}
                               onClick={() => setSelectedFile(e.id)}
                               sx={{
                                   cursor: "pointer",
                                   "&:hover": {
                                     backgroundColor: (theme) => theme.palette.action.hover,
                                   },
                               }}
                             >
                               <TableCell
                                 key={`file_table_row_${i}_cell_label`}
                               >
                                 <Typography
                                   key={`file_table_row_${i}_cell_label_text`}
                                   sx={{
                                     fontSize: theme.typography.fontSize,
                                     textOverflow: "ellipsis",
                                     overflow: "clip",
                                     // width: 200,
                                     textWrap: "nowrap",
                                   }}
                                 >
                                   {e.name}
                                 </Typography>
                               </TableCell>
                               <TableCell
                                 key={`file_table_row_${i}_cell_size`}
                               >{formatFileSize(e.fileSize)}</TableCell>
                               <TableCell
                                 key={`file_table_row_${i}_cell_usage`}
                               >
                                 {e.id === fileID ? "In-use" : "Available"}
                               </TableCell>
                             </TableRow>
                           </Tooltip>
                         );
                       })}
                     </TableBody>
                   </Table>
                 </TableContainer>
               )}
            </Grid>
            
            <Grid item>
              <Stack
                direction="row"
                columnGap={1}
                sx={{
                  width: "100%",
                  justifyContent: "end"
                }}
              >
               <Button
                  variant="contained"
                  color="secondary"
                  // fullWidth
                  onClick={() => {
                    router.push("/files/" + selectedFile);
                    router.refresh();
                  }}
                >
                  Open file
                </Button>
                
              </Stack>
            </Grid>
             
          </Grid>
          
        </DialogContent>
      </Dialog>
    </>
  );
}
