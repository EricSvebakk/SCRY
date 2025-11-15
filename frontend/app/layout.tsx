
"use client"

import { Inter } from "next/font/google";
import { Container, Paper, ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/stores/store";
import { theme } from "@/lib/design";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en">
      <body style={{ margin: 0, overflow: "hidden" }}>
        <ThemeProvider theme={theme}>
          <Container
            maxWidth={false}
            component={Paper}
            elevation={4}
            square
            disableGutters
            sx={{
              minHeight: "100vh",
              backgroundColor: theme.palette.background.paper,
              // overflowY: "hidden",
            }}
          >
            <Container
              maxWidth={false}
              disableGutters
              className="layout_outer"
              sx={{
                minHeight: "100vh",
              }}
            >
              <Provider store={store}>{children}</Provider>
            </Container>
          </Container>
        </ThemeProvider>
      </body>
    </html>
  );
}