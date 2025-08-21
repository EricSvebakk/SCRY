"use client";

import {
  Grid,
  SvgIconProps,
} from "@mui/material";
import { useParams } from "next/navigation";
import { ReactElement, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { setActiveFile } from "@/lib/redux/reducers/fileReducer";
import { get_file_hierarchy } from "@/lib/fetch/get_file_hierarchy";
import { get_genes } from "@/lib/fetch/get_genes";
import ScreenDimensionalReduction from "@/lib/components/screen/ScreenDimensionalReduction";
import ScreenDifferentialGeneExpression from "@/lib/components/screen/ScreenDifferentialGeneExpression";
import { theme } from "@/app/layout";
import { tabOptions } from "@/lib/types";
import { ScatterPlot, Tune, ViewCompact } from "@mui/icons-material";
import ScreenManageAnnData from "@/lib/components/screen/ScreenManageAnnData";
import NavbarLeft from "@/lib/components/navigation/NavbarLeft";
import NavbarRight from "@/lib/components/navigation/NavbarRight";
import { get_model_types } from "@/lib/fetch/get_model_types";

type Screen = {
  label: string;
  id: tabOptions;
  component: JSX.Element;
  icon: ReactElement<SvgIconProps>;
};

export default function FileIdPage({}) {
  
  const { fileID } = useParams();

  const status = useAppSelector((state) => state.plotReducer.status);

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
      
      setSelectedScreen(1);
      
      if (!status.get_file_hierarchy.inProgress) {
        get_file_hierarchy(fileID, dispatch);
      }
      if (!status.get_genes.inProgress) {
        get_genes(fileID, dispatch);
      }
      if (!status.get_model_types.inProgress) {
        get_model_types(fileID, dispatch);
      }
    }
  }, []);

  return (
    <Grid container direction="row" xs>
      <Grid item height="100%" width={85}>
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
