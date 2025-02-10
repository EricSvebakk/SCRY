
"use client"

import { Box, Grid, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { green, grey, red } from "@mui/material/colors";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/stores/store";

const BaseNavItems = [
  { id: "home", path: "/", name: "Home" },
  { id: "files", path: "/files", name: "Files" },
];

export default function PagesLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const [navItems, setNavItems] = useState(BaseNavItems);
  const pathname = usePathname();
  const fileState = useSelector((state: RootState) => state.fileReducer.files);
  
  const selectedFiles = useSelector((state: RootState) => state.fileReducer.selectedFiles);
  
  console.log(fileState)

  useEffect(() => {
    
    const selectedFileObjects = fileState
      .filter((file) => selectedFiles.includes(file.id))
      .map((file) => ({
        id: file.id,
        path: `/files/${file.id}`,
        name: file.name,
      }));
    
    setNavItems([...BaseNavItems, ...selectedFileObjects]);
    
  }, [selectedFiles]);
  
  
  return (
    <Box>
      <Grid
        container
        direction="row"
        p={2}
        sx={{ border: "1px solid grey" }}
      >
        {navItems.map((e) => {
          return (
            <Grid
              key={`nav_${e.id}`}
              item
              width={150}
              overflow="hidden"
            >
              {CustomNavItem({
                id: e.id,
                title: e.name,
                path: e.path,
                curPath: pathname,
              })}
            </Grid>
          );
        })}
      </Grid>
      
      {children}
    </Box>
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
              color: curPath === path ? red : green,
            }}
            primaryTypographyProps={{ noWrap: true }}
          />
        </ListItemButton>
      </ListItem>
    </Link>
  );
}