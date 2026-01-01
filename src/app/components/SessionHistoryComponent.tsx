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
  Dialog,
} from "@mui/material";
import { getApiUrl } from "../utils/api";
import { authFetch } from "../utils/authFetch";

interface Session {
  id: string;
  task_name: string;
  start_ts: string;
  end_ts: string;
  notes?: string;
}

export interface SessionHistoryComponentHandle {
  refresh: () => void;
}

const SessionHistoryComponent = forwardRef<SessionHistoryComponentHandle>(function SessionHistoryComponent(_, ref) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [editDuration, setEditDuration] = useState(0); // in minutes
  const [editNotes, setEditNotes] = useState("");
  // Helper to open dialog with session info
  const handleRowClick = (session: Session) => {
    setSelectedSession(session);
    // Calculate duration in minutes
    const start = new Date(session.start_ts);
    const end = new Date(session.end_ts);
    setEditDuration(Math.round((end.getTime() - start.getTime()) / 60000));
    setEditNotes(session.notes || "");
    setDialogOpen(true);
  };

  // Helper to handle dialog save
  const handleDialogSave = async () => {
    if (!selectedSession) return;
    setLoading(true);
    setError(null);
    try {
      // Calculate new end_ts based on new duration
      const start = new Date(selectedSession.start_ts);
      const newEnd = new Date(start.getTime() + editDuration * 60000);
      const payload = {
        id: selectedSession.id,
        changes: {
          duration: editDuration,
          notes: editNotes,
        },
      };
      const response = await authFetch("/api/v1/session_update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Failed to update session: ${response.statusText}`);
      }
      // Refresh session history
      await fetchSessionHistory();
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update session");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const fetchSessionHistory = async () => {
    try {
      setLoading(true);
  const response = await authFetch("/api/v1/session_history", {
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
                <TableRow key={session.id || idx} hover style={{ cursor: "pointer" }} onClick={() => handleRowClick(session)}>
                  <TableCell>{session.task_name}</TableCell>
                  <TableCell>{formatTime(session.start_ts)}</TableCell>
                  <TableCell>{calculateDuration(session.start_ts, session.end_ts)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="xs" fullWidth>
        <Stack spacing={2} sx={{ p: 3 }}>
          <Typography variant="h6">Edit Session</Typography>
          <Typography variant="subtitle2">Task: {selectedSession?.task_name}</Typography>
          <Typography variant="subtitle2">Start: {selectedSession ? formatTime(selectedSession.start_ts) : ""}</Typography>
          <label>
            Duration (minutes):
            <input
              type="number"
              min={1}
              value={editDuration}
              onChange={e => setEditDuration(Number(e.target.value))}
              style={{ width: 80, marginLeft: 8 }}
            />
          </label>
          <label>
            Notes:
            <textarea
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              rows={3}
              style={{ width: "100%", marginTop: 4 }}
            />
          </label>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <button onClick={handleDialogClose}>Cancel</button>
            <button onClick={handleDialogSave} disabled={loading}>Save</button>
          </Stack>
        </Stack>
      </Dialog>
    </Stack>
  );
});

export default SessionHistoryComponent;
