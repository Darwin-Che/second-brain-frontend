import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Stack,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from "@mui/material";
import { getApiUrl } from "../utils/api";
import { authFetch } from "../utils/authFetch";

interface Session {
  task_name: string;
  start_ts: string;
  end_ts: string;
}

export interface SessionHistoryComponentHandle {
  refresh: () => void;
}

const SessionHistoryComponent = forwardRef<SessionHistoryComponentHandle>(function SessionHistoryComponent(_, ref) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionHistory = async () => {
    try {
      setLoading(true);
      const response = await authFetch(getApiUrl("/api/v1/session_history"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch session history: ${response.statusText}`);
      }

      const data = await response.json();
      setSessions(data.session_history || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session history");
      console.error("Error fetching session history:", err);
    } finally {
      setLoading(false);
    }
  };

  const { account } = useAuth();

  useEffect(() => {
    fetchSessionHistory();
  }, [account]);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      fetchSessionHistory();
    },
  }));

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateDuration = (startTs: string, endTs: string) => {
    const start = new Date(startTs);
    const end = new Date(endTs);
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Session History
        </Typography>
        <Typography>Loading...</Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Session History
        </Typography>
        <Typography color="error">{error}</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Session History
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Task Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Start Time</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    No sessions yet
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session, idx) => (
                <TableRow key={idx}>
                  <TableCell>{session.task_name}</TableCell>
                  <TableCell>{formatTime(session.start_ts)}</TableCell>
                  <TableCell>{calculateDuration(session.start_ts, session.end_ts)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
});

export default SessionHistoryComponent;
