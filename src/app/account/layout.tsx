"use client";
import React from "react";
import TopTabAppBar from "../components/TopTabAppBar";
import { usePathname, useRouter } from "next/navigation";

interface AccountLayoutProps {
  children: React.ReactNode;
}

const pathnameToTab = (pathname: string) => {
  if (pathname === "/account") return 1;
  return 0;
};

const AccountLayout: React.FC<AccountLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const tab = pathnameToTab(pathname);

  return (
    <>
      <TopTabAppBar
        tab={tab}
        onTabChange={(_, v) => {
          if (v === 0) router.push("/");
          if (v === 1) router.push("/account");
        }}
      />
      {children}
    </>
  );
};

export default AccountLayout;
