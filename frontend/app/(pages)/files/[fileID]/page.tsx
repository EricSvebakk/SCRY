"use client";

import {
  Grid,
  SvgIconProps,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { ReactElement, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { setActiveFile, setActiveUser, setPassKey } from "@/lib/redux/reducers/fileReducer";
import ScreenDimensionalReduction from "@/lib/components/navigation/screen/ScreenDimensionalReduction";
import ScreenDifferentialGeneExpression from "@/lib/components/navigation/screen/ScreenDifferentialGeneExpression";
import { theme } from "@/app/layout";
import { ScatterPlot, ViewCompact } from "@mui/icons-material";
import NavbarLeft from "@/lib/components/navigation/NavbarLeft";
import NavbarRight from "@/lib/components/navigation/NavbarRight";
import { useCelltypistModelsQuery, useFileGenesQuery, useLazyFileHierarchyQuery, useSystemFilesQuery } from "@/lib/redux/api/api";
import { setAnndataField } from "@/lib/redux/reducers/plotReducer";
import { AnndataAttributeKeys } from "@/lib/types";

type Screen = {
  label: string;
  id: string;
  component: JSX.Element;
  icon: ReactElement<SvgIconProps>;
};

export default function FileIdPage({}) {
  
  const { fileID } = useParams();
 
  const userID = useAppSelector((state) => state.fileReducer.userID);
  const passKey = useAppSelector((state) => state.fileReducer.passKey);
  
  const params = {
    skip: (userID === "") || (passKey === "")
  }
  
  const { } = useSystemFilesQuery(undefined, params);
  const { } = useFileGenesQuery(undefined, params);
  const { } = useCelltypistModelsQuery(undefined, params);
  const [getFileHierarchy] = useLazyFileHierarchyQuery();
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [selectedScreen, setSelectedScreen] = useState<number>(0);
  
  const screens: Screen[] = [
    {
      label: "Dimensional Reduction",
      id: "scatterplot",
      component: <ScreenDimensionalReduction />,
      icon: <ScatterPlot />,
    },
    {
      label: "Differential Expression",
      id: "dotplot",
      component: <ScreenDifferentialGeneExpression />,
      icon: <ViewCompact />,
    },
  ];
  
  useEffect(() => {
    
    if (typeof fileID === "string" && fileID !== "") {
      dispatch(setActiveFile(fileID));
      dispatch(setActiveUser(localStorage.getItem("user_id") ?? ""));
      dispatch(setPassKey(localStorage.getItem("passkey_hash") ?? ""));
      
      if (localStorage.getItem("file_id") === fileID) {
        AnndataAttributeKeys.forEach((key) => {
          dispatch(
            setAnndataField({
              attribute: key,
              field: "keys",
              value: JSON.parse(localStorage.getItem(key)!),
            })
          );
        });
      } else {
        getFileHierarchy();
        localStorage.setItem("file_id", fileID)
      }
      
      setSelectedScreen(0);

    } else {
      router.push("/");
      router.refresh();      
    }
  }, []);

  return (
    <Grid container direction="row" xs>
      <Grid item height="100%" width={90}>
        <NavbarLeft
          screens={screens}
          selectedScreen={selectedScreen}
          setSelectedScreen={setSelectedScreen}
        />
      </Grid>

      <Grid
        item
        xs
        height="100%"
        sx={{
          p: "1vh",
          backgroundColor: theme.palette.background.default,
        }}
      >
        {screens[selectedScreen].component}
      </Grid>

      <Grid
        item
        height="100%"
        sx={{ position: "relative" }}
        width={85}
      >
        <NavbarRight />
      </Grid>
    </Grid>
  );
}
