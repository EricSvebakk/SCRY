
"use client"

import { Inter } from "next/font/google";
import { Container, createTheme, Paper, ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/stores/store";

const inter = Inter({ subsets: ["latin"] });

export const theme = createTheme({
  palette: {
    // primary: {
    //   main: ""
    // },
    // action: {
    //   // disabledBackground:"rgb(147, 187, 227)",
    // },
    // back
    primary: {
      main: "#aaaaff",
    },
    secondary: {
      main: "#d9d9feff"
    },
    // text: {
    //   secondary: "#ffffff"
    // },
    // secondary: {
    // }
    background: {
      // paper: "#afa",
      paper: "#ffffff",
      default: "#aaaaff"
    }
  },
  typography: {
    fontSize: 12,
    subtitle1: {
      fontSize: 9
    }
  }
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
              minHeight: "100vh",
              backgroundColor: theme.palette.background.paper,
              overflowY: "hidden"
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
              <Provider store={store}>
                {children}
              </Provider>
            </Container>
          </Container>
        </ThemeProvider>
      </body>
    </html>
  );
}