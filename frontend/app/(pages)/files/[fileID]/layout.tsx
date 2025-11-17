
"use client"

import { Grid, SvgIconProps } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { ReactElement, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { theme } from "@/lib/design";
import { ScatterPlot, ViewCompact } from "@mui/icons-material";
import {
  useCelltypistModelsQuery,
  useLazyMetadataQuery,
  useSystemFilesQuery,
} from "@/lib/redux/api/api";
import {
  setActiveFile,
  setActiveUser,
  setPassKey,
} from "@/lib/redux/reducers/plotReducer";
import ScreenDimensionalReduction from "@/app/(pages)/files/[fileID]/[screenID]/screen/ScreenDimensionalReduction";
import ScreenDifferentialGeneExpression from "@/app/(pages)/files/[fileID]/[screenID]/screen/ScreenDifferentialGeneExpression";
import NavbarLeft from "@/lib/components/navigation/NavbarLeft";
import NavbarRight from "@/lib/components/navigation/NavbarRight";

type Screen = {
  label: string;
  id: string;
  component: JSX.Element;
  icon: ReactElement<SvgIconProps>;
};

export default function LayoutApp({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const { fileID } = useParams();

  const userID = useAppSelector((state) => state.plotReducer.system.user.id);
  const passKey = useAppSelector((state) => state.plotReducer.system.user.passKey);

  const params = {
    skip: userID === "" || passKey === "",
  };

  const {} = useSystemFilesQuery(undefined, params);
  // const {} = useGenesQuery(undefined, params);
  const {} = useCelltypistModelsQuery(undefined, params);
  // const [getFileHierarchy] = useLazyHierarchyQuery();
  const [getMetadata] = useLazyMetadataQuery();

  const router = useRouter();
  const dispatch = useAppDispatch();

  const screens: Screen[] = [
    {
      label: "Dimensional Reduction",
      id: "dimensional-reduction",
      component: <ScreenDimensionalReduction />,
      icon: <ScatterPlot />,
    },
    {
      label: "Differential Expression",
      id: "differential-expression",
      component: <ScreenDifferentialGeneExpression />,
      icon: <ViewCompact />,
    },
  ];

  useEffect(() => {
    if (typeof fileID === "string" && fileID !== "") {
      dispatch(setActiveFile(fileID));
      dispatch(setActiveUser(localStorage.getItem("user_id") ?? ""));
      dispatch(setPassKey(localStorage.getItem("passkey_hash") ?? ""));

      // getFileHierarchy();
      getMetadata();
      
      // if (localStorage.getItem("file_id") === fileID) {
      //   AnndataAttributeKeys.forEach((key) => {
      //     dispatch(
      //       setAnndataField({
      //         attribute: key,
      //         field: "keys",
      //         value: JSON.parse(localStorage.getItem(`${fileID}_${key}`)!),
      //       })
      //     );
      //   });
      // } else {
      //   // getFileHierarchy();
      //   localStorage.setItem("file_id", fileID);
      // }
      
    } else {
      router.push("/");
      router.refresh();
    }
  }, []);
  
  return (
    <Grid
      container
      direction="row"
      sx={{
        height: "100%",
      }}
    >
      <Grid
        item
        width={90}
        sx={{
          height: "100%",
          backgroundColor: theme.palette.secondary.main,
        }}
      >
        <NavbarLeft
          screens={screens}
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
        {children}
      </Grid>

      <Grid
        item
        sx={{
          height: "100%",
          width: 85,
          position: "relative",
        }}
      >
        <NavbarRight />
      </Grid>
    </Grid>
  );
  
}