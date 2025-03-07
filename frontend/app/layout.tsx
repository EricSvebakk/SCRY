
"use client"

import { Inter } from "next/font/google";
import { Box, Container, createTheme, Paper, ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/stores/store";
import { grey } from "@mui/material/colors";

const inter = Inter({ subsets: ["latin"] });

export const theme = createTheme({
  palette: {
    // action: {
    //   // disabledBackground:"rgb(147, 187, 227)",
    // },
    background: {
      // paper: grey[300],
      // default: "white"
    }
  },
  // spacing: 8
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <ThemeProvider theme={theme}>
          <Container
            maxWidth={false}
            component={Paper}
            elevation={4}
            square
            disableGutters
            sx={{
              minHeight: "100vh"
            }}
          >
            <Container
              maxWidth={false}
              disableGutters
              sx={{
                padding: 2,
                minHeight: "100%",
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