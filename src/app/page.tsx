"use client";

import React, { useState, useEffect, useRef } from "react";
import CurrentComponentBusy from "./components/CurrentComponentBusy";
import CurrentComponentIdle from "./components/CurrentComponentIdle";
import SessionHistoryComponent, { SessionHistoryComponentHandle } from "./components/SessionHistoryComponent";
import Dialog from "@mui/material/Dialog";
import LoginDialogContent from "./components/LoginDialogContent";
import { useAuth } from "./context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { getApiUrl } from "./utils/api";

import Button from "@mui/material/Button";
import {
  Stack,
  Typography,
} from "@mui/material";
import TopTabAppBar from "./components/TopTabAppBar";

export function Experiment() {
  return <Button variant="contained">Hello world</Button>;
}

interface BrainState {
  brain_status: "busy" | "idle" | "onboarding";
}

function CurrentComponent({ onSessionHistoryRefresh }: { onSessionHistoryRefresh?: () => void }) {
  const [brainState, setBrainState] = useState<BrainState | null>(null);
  const [loading, setLoading] = useState(true);
  const { account } = useAuth();

  useEffect(() => {
    const fetchBrainState = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl("/api/v1/brain/state"), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch brain state: ${response.statusText}`);
        }

        const data = await response.json();
        setBrainState(data.brain_state);
      } catch (err) {
        console.error("Error fetching brain state:", err);
      } finally {
        setLoading(false);
      }
    };

    if (account) {
      fetchBrainState();
    }
  }, [account]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!brainState) {
    return <div>Error loading brain state.</div>;
  }

  const handleSessionStarted = (newBrainState: BrainState) => {
    setBrainState(newBrainState);
  };

  const handleSessionEnded = (newBrainState: BrainState) => {
    setBrainState(newBrainState);
  };

  switch (brainState.brain_status) {
    case "busy":
      return (
        <CurrentComponentBusy 
          onSessionEnded={handleSessionEnded}
          onSessionEndedRefresh={onSessionHistoryRefresh}
          brainState={brainState}
        />
      );
    case "idle":
      return <CurrentComponentIdle onSessionStarted={handleSessionStarted} brainState={brainState} />;
    case "onboarding":
      return <CurrentComponentIdle onSessionStarted={handleSessionStarted} brainState={brainState} />;
    default:
      return <div>Error loading current process.</div>;
  }
}

export default function Page() {
  const { account, loading, refresh } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const tab = pathname === "/account" ? 1 : 0;
  const sessionHistoryRef = useRef<SessionHistoryComponentHandle>(null);

  useEffect(() => {
    if (!loading) {
      setLoginOpen(!account);
    }
  }, [account, loading]);

  const handleGoogleLogin = () => {
    window.location.href = getApiUrl("/auth/google");
  };

  const handleSessionHistoryRefresh = () => {
    if (sessionHistoryRef.current) {
      sessionHistoryRef.current.refresh();
    }
  };

  return (
    <>
      <Dialog open={loginOpen} disableEscapeKeyDown onClose={() => { }}>
        <LoginDialogContent />
      </Dialog>
      <main>
        <Stack spacing={3}>
          <CurrentComponent onSessionHistoryRefresh={handleSessionHistoryRefresh} />
          <SessionHistoryComponent ref={sessionHistoryRef} />
        </Stack>
      </main>
    </>
  );
}
