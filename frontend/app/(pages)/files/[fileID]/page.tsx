
"use client"

import { Box } from "@mui/material";
import { useParams, useRouter } from "next/navigation";

export default function LandingPage() {
  
  const { fileID, screenID } = useParams();
  const router = useRouter();
  
  if (screenID == "") {
    router.push(`/files/${fileID}/dimensional-reduction`);
  }
  
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
      }}
    />
  )
  
}