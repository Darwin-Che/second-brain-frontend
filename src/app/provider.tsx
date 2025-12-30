"use client";

import { ThemeProvider, CssBaseline, Box, createTheme } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";

const theme = createTheme();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            maxWidth: 400,
            mx: "auto",
            minHeight: "100vh",
          }}
        >
          {children}
        </Box>
      </ThemeProvider>
    </AuthProvider>
  );
}
