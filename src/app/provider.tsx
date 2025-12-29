"use client";

import { ThemeProvider, CssBaseline, Box, createTheme } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import { red } from "@mui/material/colors";

const theme = createTheme({
  spacing: 4,
  palette: {
    primary: {
      main: red[500],
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            maxWidth: 390,
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
