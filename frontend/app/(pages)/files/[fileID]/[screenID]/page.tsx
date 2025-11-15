
"use client"

import { Box } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import ScreenDimensionalReduction from "@/app/(pages)/files/[fileID]/[screenID]/screen/ScreenDimensionalReduction";
import ScreenDifferentialGeneExpression from "@/app/(pages)/files/[fileID]/[screenID]/screen/ScreenDifferentialGeneExpression";

export default function PageDifferentialExpression() {
  
  const { fileID, screenID } = useParams();
  const router = useRouter();
  
  if (screenID === "dimensional-reduction") {
    return <ScreenDimensionalReduction />
  }
  
  else if (screenID === "differential-expression") {
    return <ScreenDifferentialGeneExpression />
  }
  
  else {
    router.push(`/files/${fileID}/dimensional-reduction`);
  }
  
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        backgroundColor: "white",
        border: "1px solid grey"
      }}
    />
  );
}
