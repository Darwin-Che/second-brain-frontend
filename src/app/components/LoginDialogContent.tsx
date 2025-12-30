import React from "react";
import { Stack, Typography, Button } from "@mui/material";
import { getApiUrl } from "../utils/api";

export default function LoginDialogContent() {
  const handleGoogleLogin = () => {
    window.location.href = getApiUrl("/auth/google");
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
