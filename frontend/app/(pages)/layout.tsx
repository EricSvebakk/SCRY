
"use client"

import { Grid, ListItem, ListItemButton, ListItemText, Stack } from "@mui/material";
import { green, grey, red } from "@mui/material/colors";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RootState } from "@/lib/redux/stores/store";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/hooks";
import { addFile } from "@/lib/redux/reducers/fileReducer";

const BaseNavItems = [
  { id: "file_selection", path: "/", name: "File Selection" },
  // { id: "files", path: "/files", name: "Files" },
];

export default function PagesLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const [navItems, setNavItems] = useState(BaseNavItems);
  const pathname = usePathname();
  
  const dispatch = useAppDispatch();
  
  const files = useAppSelector((state: RootState) => state.fileReducer.files);
  const activeFile = useAppSelector((state: RootState) => state.fileReducer.activeFile);
  const selectedFiles = useAppSelector((state: RootState) => state.fileReducer.selectedFiles);

  useEffect(() => {
    
    console.log("BRUH", pathname)
    
    if ((activeFile !== "") && !files.map((e) => e.id).includes(activeFile)) {
      dispatch(addFile({
        id: activeFile,
        name: activeFile,
        fileSize: 0,
        fileType: activeFile.split(".")[1]
      }));
    }
    
    const selectedFileObjects = files
      .filter((file) => selectedFiles.includes(file.id) || (file.id === activeFile))
      .map((file) => {
        console.log(file)
        return {
          id: file.id,
          path: `/files/${file.id}`,
          name: file.name,
        };
      });
    
    setNavItems([...BaseNavItems, ...selectedFileObjects]);
    
  }, [activeFile, selectedFiles, files]);
  
  
  return (
    <Stack
      direction="column"
      rowGap={1}
      className="layout_inner"
      sx={{
        minHeight: "98vh",
      }}
    >
      <Grid
        container
        direction="row"
        p={1}
        sx={{
          border: "1px solid orange"
        }}
      >
        {navItems.map((item) => {
          return (
            <Grid
              key={`nav_${item.id}`}
              item
              width="fit-content"
              overflow="hidden"
            >
              {CustomNavItem({
                id: item.id,
                title: item.name,
                path: item.path,
                curPath: pathname,
              })}
            </Grid>
          );
        })}
      </Grid>
      
      {children}
    </Stack>
  );
}

type CustomNavItemProps = {
  id: string;
  title: string;
  path: string;
  curPath: string;
};

function CustomNavItem({ id, title, path, curPath }: CustomNavItemProps) {
  return (
    <Link
      key={`nav_link_${id}`}
      href={path}
      style={{
        textDecoration: "none",
      }}
    >
      <ListItem
        key={`nav_item_${id}`}
        disablePadding
        style={{
          borderStyle: "solid",
          borderWidth: 2,
          borderColor: grey[500],
          borderRadius: 10,
        }}
      >
        <ListItemButton key={`nav_item_button_${id}`}>
          <ListItemText
            key={`nav_item_text_${id}`}
            primary={title}
            sx={{
              "& .MuiListItemText-primary": {
                fontFamily: ["Roboto", "Helvetica", "Arial", "sans - serif"],
                lineHeight: undefined,
                fontSize: "0.8125rem",
              },
              color: curPath === path ? red : green,
            }}
            primaryTypographyProps={{ noWrap: true }}
          />
        </ListItemButton>
      </ListItem>
    </Link>
  );
}