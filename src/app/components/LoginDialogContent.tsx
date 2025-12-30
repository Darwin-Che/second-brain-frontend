import React from "react";
import { Stack, Typography, Button } from "@mui/material";
import { getApiUrl } from "../utils/api";

export default function LoginDialogContent() {
  const handleGoogleLogin = () => {
  // Open in a new tab (target _blank) so DevTools can capture network traces
  // and the backend can still postMessage back to window.opener.
  const url = getApiUrl("/auth/google");
  console.debug("Opening OAuth in new tab", { url });
  window.open(url, "_blank");
  };

  return (
    <Stack spacing={3} alignItems="center">
      <Typography variant="h5">Welcome to SecondBrain</Typography>
      <Typography variant="body1" textAlign="center">
        Sign in with your Google account to get started
      </Typography>
      <Button
        variant="contained"
        fullWidth
        onClick={handleGoogleLogin}
        size="large"
      >
        Sign in with Google
      </Button>
    </Stack>
  );
}
