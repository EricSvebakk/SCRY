"use client";

import {
  Grid,
  SvgIconProps,
} from "@mui/material";
import { useParams } from "next/navigation";
import { ReactElement, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { setActiveFile, setActiveUser } from "@/lib/redux/reducers/fileReducer";
import ScreenDimensionalReduction from "@/lib/components/navigation/screen/ScreenDimensionalReduction";
import ScreenDifferentialGeneExpression from "@/lib/components/navigation/screen/ScreenDifferentialGeneExpression";
import { theme } from "@/app/layout";
import { ScatterPlot, Tune, ViewCompact } from "@mui/icons-material";
import ScreenManageAnnData from "@/lib/components/navigation/screen/ScreenManageAnnData";
import NavbarLeft from "@/lib/components/navigation/NavbarLeft";
import NavbarRight from "@/lib/components/navigation/NavbarRight";
import { useFileGenesQuery, useFileHierarchyQuery } from "@/lib/redux/api/api";

type Screen = {
  label: string;
  id: string;
  component: JSX.Element;
  icon: ReactElement<SvgIconProps>;
};

export default function FileIdPage({}) {
  
  const { fileID } = useParams();

  const status = useAppSelector((state) => state.plotReducer.status);
  const userID = useAppSelector((state) => state.fileReducer.userID);
  const { } = useFileHierarchyQuery({ fileID: fileID as string, userID: userID }, { skip: userID === "anonymous" });
  const { } = useFileGenesQuery({ fileID: fileID as string, userID: userID }, { skip: userID === "anonymous" });
  
  const dispatch = useAppDispatch();
  
  const [selectedScreen, setSelectedScreen] = useState<number>(1);
  
  const screens: Screen[] = [
    {
      label: "Manage AnnData",
      id: "table",
      component: <ScreenManageAnnData />,
      icon: <Tune />,
    },
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
    
    if (typeof fileID === "string") {
      dispatch(setActiveFile(fileID));
      dispatch(setActiveUser("Eric"));
      
      setSelectedScreen(1);

      // if (!status.get_model_types.inProgress) {
      //   get_model_types(fileID, dispatch);
      // }
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
