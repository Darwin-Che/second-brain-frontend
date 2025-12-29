"use client";

import React, { useState, useEffect } from "react";
import TopTabAppBar from "./components/TopTabAppBar";
import Dialog from "@mui/material/Dialog";
import LoginDialogContent from "./components/LoginDialogContent";
import { useAuth } from "./context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

import Button from "@mui/material/Button";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  styled,
  TextField,
  Typography,
} from "@mui/material";

export function Experiment() {
  return <Button variant="contained">Hello world</Button>;
}

const PaperV1 = styled(Paper)(({ theme }) => ({
  width: 120,
  height: 120,
  padding: theme.spacing(2),
  square: false,
  variant: "outlined",
  ...theme.typography.body2,
  textAlign: "center",
}));

function CurrentComponentBUSY() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={5} padding={2}>
          <Stack direction="row" spacing={2}>
            <Typography variant="h6" sx={{ flex: 1 }}>
              BUSY: TASK
            </Typography>
            <Typography variant="h6" sx={{ flex: 1, textAlign: "right" }}>
              {new Date().toLocaleTimeString()}
            </Typography>
          </Stack>
          <TextField
            id="filled-multiline-static"
            label="Notes"
            multiline
            minRows={3}
            defaultValue=""
            variant="filled"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function CurrentComponentIdle() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">IDLE since 5pm for 30min</Typography>

          <FormControl>
            <InputLabel id="current-display-idle-form-task-label">
              Task
            </InputLabel>
            <Select
              labelId="current-display-idle-form-task-label"
              autoWidth
              label="Age"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={21}>Twenty one</MenuItem>
              <MenuItem value={22}>Twenty one and a half</MenuItem>
            </Select>
          </FormControl>

          <Stack direction="row" spacing={2}>
            <FormControl>
              <TextField
                id="filled-search"
                label="Search field"
                type="search"
                variant="filled"
              />
            </FormControl>
            <Typography variant="body1">Till 3PM</Typography>
          </Stack>
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: "center" }}>
        <Button size="large" variant="contained">
          Start
        </Button>
      </CardActions>
    </Card>
  );
}

function CurrentComponent() {
  // Possible Status: "BUSY", "IDLE"
  const status: String = "IDLE";
  switch (status) {
    case "BUSY":
      return CurrentComponentBUSY();
    case "IDLE":
      return CurrentComponentIdle();
    default:
      return <div>Error loading current process.</div>;
  }
}

function HistoryItem() {
  return (
    <Stack direction="row" spacing={2}>
      <Typography variant="body1">Task Name</Typography>
      <Typography variant="body1">Start Time</Typography>
      <Typography variant="body1">End Time</Typography>
    </Stack>
  );
}

function HistoryComponent() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">History</Typography>
        <Stack spacing={2}>
          <HistoryItem />
          <HistoryItem />
          <HistoryItem />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Page() {
  const { account, loading, refresh } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const tab = pathname === "/account" ? 1 : 0;

  useEffect(() => {
    if (!loading) {
      setLoginOpen(!account);
    }
  }, [account, loading]);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  return (
    <>
      <TopTabAppBar
        tab={tab}
        onTabChange={(_, v) => {
          if (v === 0) router.push("/");
          if (v === 1) router.push("/account");
        }}
      />
      <Dialog open={loginOpen} disableEscapeKeyDown onClose={() => {}}>
        <LoginDialogContent onGoogleLogin={handleGoogleLogin} />
      </Dialog>
      <main>
        <Stack spacing={2}>
          <CurrentComponent />
          <HistoryComponent />
        </Stack>
      </main>
    </>
  );
}

/*
<main style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
<Experiment />

{activeTask && (
	<section style={{ marginBottom: 32 }}>
		<h2>Active Task</h2>
		<div>
			<strong>{activeTask.project.name}</strong>
			<div>
				Time left: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
			</div>
			<button onClick={endTask} style={{ marginTop: 8 }}>
				End Early
			</button>
		</div>
	</section>
)}

History
<section>
	<h2>History</h2>
	<ul>
		{history.map((h, idx) => (
			<li key={idx}>
				{h.project.name} | {new Date(h.start).toLocaleTimeString()} - {new Date(h.end).toLocaleTimeString()} | {Math.floor(h.duration / 60)}:{String(h.duration % 60).padStart(2, "0")}
			</li>
		))}
	</ul>
</section>
</main>
*/
