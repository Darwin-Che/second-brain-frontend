import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Link from "next/link";
import Box from "@mui/material/Box";

interface TopTabAppBarProps {
  tab: number;
  onTabChange: (event: React.SyntheticEvent, value: number) => void;
}

const TopTabAppBar: React.FC<TopTabAppBarProps> = ({ tab, onTabChange }) => (
  <AppBar
    position="static"
    color="default"
    elevation={0}
    sx={{
      borderBottom: "1px solid #e0e0e0",
      background: "#fff",
      boxShadow: "none",
      alignItems: "center",
    }}
  >
    <Toolbar sx={{ minHeight: 48, justifyContent: "center", width: "100%" }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 600,
          mx: "auto",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Tabs
          value={tab}
          onChange={onTabChange}
          textColor="primary"
          indicatorColor="primary"
          centered
          sx={{ minHeight: 48 }}
        >
          <Tab
            label="SecondBrain"
            component={Link}
            href="/"
            sx={{ minWidth: 120, fontWeight: 500 }}
          />
          <Tab
            label="Account"
            component={Link}
            href="/account"
            sx={{ minWidth: 120, fontWeight: 500 }}
          />
        </Tabs>
      </Box>
    </Toolbar>
  </AppBar>
);

export default TopTabAppBar;
