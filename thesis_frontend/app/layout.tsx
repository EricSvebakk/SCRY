
"use client"

import { Inter } from "next/font/google";
import "./globals.css";
import { Box, Button, Container, Grid, ListItem, ListItemButton, ListItemText, Paper } from "@mui/material";
import Link from "next/link";
import { green, red } from "@mui/material/colors";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/stores/store";

const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  
  return (
    <html lang="en">
      <body>
        <Box>
          <Container
            maxWidth="lg"
            component={Paper}
            elevation={4}
            square
            sx={{
              minHeight: "100vh",
            }}
          >
            <Container
              disableGutters
              sx={{
                padding: 2,
                // margin: 0,
                minHeight: "100%",
                border: "1px solid red",
              }}
            >
              <Provider store={store}>
                {children}
              </Provider>
            </Container>
          </Container>
        </Box>
      </body>
    </html>
  );
}