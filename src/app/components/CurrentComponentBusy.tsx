import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Stack,
  TextField,
  Typography,
  Button,
  LinearProgress,
  Box,
} from "@mui/material";
import { getApiUrl } from "../utils/api";
import { authFetch } from "../utils/authFetch";

interface WorkSession {
  task_name: string;
  start_ts: string;
  end_ts: string;
  notes?: string;
}

interface BrainState {
  brain_status: "busy" | "idle" | "onboarding";
  last_session?: WorkSession;
  [key: string]: any;
}

interface CurrentComponentBusyProps {
  onSessionEnded?: (newBrainState: BrainState) => void;
  onSessionEndedRefresh?: () => void;
  brainState?: BrainState;
}

export default function CurrentComponentBusy({ onSessionEnded, onSessionEndedRefresh, brainState }: CurrentComponentBusyProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaveError, setNotesSaveError] = useState<string | null>(null);

  const session = brainState?.last_session;

  // Update elapsed time every second
  useEffect(() => {
    if (!session?.start_ts) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(session.start_ts);
      const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
      setElapsedTime(Math.max(0, elapsed));
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.start_ts]);

  // Debounced note updates - save notes 1 second after user stops typing
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      setIsSavingNotes(true);
      setNotesSaveError(null);
      
      try {
  const response = await authFetch("/api/v1/update_notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notes: notes.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save notes: ${response.statusText}`);
        }

        console.log("Notes saved successfully");
      } catch (err) {
        setNotesSaveError(err instanceof Error ? err.message : "Failed to save notes");
        console.error("Error saving notes:", err);
      } finally {
        setIsSavingNotes(false);
      }
    }, 1000); // Wait 1 second after user stops typing

    return () => clearTimeout(debounceTimer);
  }, [notes]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getProgressPercentage = () => {
    if (!session?.start_ts || !session?.end_ts) return 0;
    
    const start = new Date(session.start_ts);
    const end = new Date(session.end_ts);
    const total = end.getTime() - start.getTime();
    const elapsed = Math.min(elapsedTime * 1000, total);
    
    return Math.round((elapsed / total) * 100);
  };

  const getSessionDuration = () => {
    if (!session?.start_ts || !session?.end_ts) return 0;
    
    const start = new Date(session.start_ts);
    const end = new Date(session.end_ts);
    return Math.floor((end.getTime() - start.getTime()) / 1000);
  };

  const handleEndSession = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
  const response = await authFetch("/api/v1/end_session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Failed to end session: ${response.statusText}`);
      }

      const data = await response.json();
      
      setNotes("");
      
      if (onSessionEnded && data.new_brain_state) {
        onSessionEnded(data.new_brain_state);
      }
      
      if (onSessionEndedRefresh) {
        onSessionEndedRefresh();
      }
      
      console.log("Session ended successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end session");
      console.error("Error ending session:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          {/* Session Info Header */}
          <Stack spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {session?.task_name || "{{TaskNameHolder}}"}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ fontSize: "0.9rem" }}>
              <Typography variant="body2">
                Start: {session?.start_ts ? formatTime(session.start_ts) : "--:--"}
              </Typography>
              <Typography variant="body2">
                End: {session?.end_ts ? formatTime(session.end_ts) : "--:--"}
              </Typography>
            </Stack>
          </Stack>

          {/* Progress Bar with Time Info */}
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Elapsed: {formatDuration(elapsedTime)}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {getProgressPercentage()}%
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Total: {formatDuration(getSessionDuration())}
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={getProgressPercentage()}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Stack>

          {/* Notes Section */}
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Notes
              </Typography>
              {isSavingNotes && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Saving...
                </Typography>
              )}
              {notesSaveError && (
                <Typography variant="caption" sx={{ color: "error" }}>
                  {notesSaveError}
                </Typography>
              )}
              {!isSavingNotes && !notesSaveError && !notes.trim() && (
                <Typography variant="caption" sx={{ color: "success.main" }}>
                  ✓ Cleared
                </Typography>
              )}
              {!isSavingNotes && !notesSaveError && notes.trim() && (
                <Typography variant="caption" sx={{ color: "success.main" }}>
                  ✓ Saved
                </Typography>
              )}
            </Stack>
            <TextField
              multiline
              minRows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              variant="outlined"
              fullWidth
              disabled={isSubmitting}
              placeholder="Add notes about this session..."
            />
          </Stack>
          {error && <Typography color="error">{error}</Typography>}
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: "center" }}>
        <Button 
          size="large" 
          variant="contained"
          color="error"
          disabled={isSubmitting}
          onClick={handleEndSession}
        >
          {isSubmitting ? "Ending..." : "End Session"}
        </Button>
      </CardActions>
    </Card>
  );
}
