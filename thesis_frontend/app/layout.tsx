
"use client"

import { Inter } from "next/font/google";
import { Box, Container, Paper } from "@mui/material";
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
            disableGutters
            sx={{
              minHeight: "100vh",
            }}
          >
            <Container
              disableGutters
              sx={{
                padding: 2,
                minHeight: "100%",
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