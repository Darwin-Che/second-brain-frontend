import React from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import GoogleIcon from "@mui/icons-material/Google";

interface LoginDialogContentProps {
  onGoogleLogin: () => void;
}

import { useAuth } from "../context/AuthContext";

const LoginDialogContent: React.FC<LoginDialogContentProps> = ({
  onGoogleLogin,
}) => {
  const { account } = useAuth();
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      py={4}
      px={2}
    >
      {account && (
        <Typography variant="body1" color="primary.main" gutterBottom>
          Welcome, {account.name} ({account.email})
        </Typography>
      )}
      <Typography variant="h5" component="h2" gutterBottom>
        Sign in to Second Brain
      </Typography>
      <Button
        variant="contained"
        startIcon={<GoogleIcon />}
        onClick={onGoogleLogin}
        sx={{
          mt: 3,
          px: 4,
          py: 1.5,
          fontSize: 18,
          borderRadius: 2,
          backgroundColor: "#4285F4",
          color: "white",
          boxShadow: 2,
          "&:hover": { backgroundColor: "#357ae8" },
        }}
      >
        Sign in with Google
      </Button>
    </Box>
  );
};

export default LoginDialogContent;
