"use client";
import React from "react";
import { Tabs, Tab } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopTabAppBar() {
  const pathname = usePathname();
  const value = pathname === "/account" ? 1 : 0;

  return (
    <Tabs value={value}>
      <Tab label="Home" component={Link} href="/" />
      <Tab label="Account" component={Link} href="/account" />
    </Tabs>
  );
}
