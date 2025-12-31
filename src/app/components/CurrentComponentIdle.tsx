import React, { useState, useEffect } from "react";
import {
    Card,
    CardActions,
    CardContent,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
    Button,
} from "@mui/material";
import { NumberSpinner } from './NumberSpinner';
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../utils/api";
import { authFetch } from "../utils/authFetch";

interface RecommendedTask {
    task_name: string;
    desired_effort: number;
    current_percent_effort: number;
    last_session: {
        start_ts: string;
        end_ts: string;
        task_name: string;
    } | null;
}

interface BrainState {
    brain_status: "busy" | "idle" | "onboarding";
    last_session?: {
        task_name: string;
        start_ts: string;
        end_ts: string;
        notes?: string;
    } | null;
    [key: string]: any;
}

interface CurrentComponentIdleProps {
    onSessionStarted?: (newBrainState: BrainState) => void;
    brainState?: BrainState;
}

export default function CurrentComponentIdle({ onSessionStarted, brainState }: CurrentComponentIdleProps) {
    const [tasks, setTasks] = useState<RecommendedTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState("");
    const [endTime, setEndTime] = useState(30);
    const [cachedEndTimeISO, setCachedEndTimeISO] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [idleTime, setIdleTime] = useState(0);
    const { account } = useAuth();

    const handleEndTimeChange = (newValue: number) => {
        setEndTime(newValue);
        const now = new Date();
        const endDateTime = new Date(now.getTime() + newValue * 60 * 1000);
        endDateTime.setSeconds(0);
        endDateTime.setMilliseconds(0);
        const isoString = endDateTime.toISOString().replace(/\.\d{3}Z$/, 'Z');
        setCachedEndTimeISO(isoString);
    };

    const displayEndTime = (() => {
        if (!cachedEndTimeISO) return "--:--";
        const endDate = new Date(cachedEndTimeISO);
        const hours = endDate.getHours();
        const minutes = String(endDate.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    })();

    const formatIdleTime = (seconds: number) => {
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

    useEffect(() => {
        const now = new Date();
        const endDateTime = new Date(now.getTime() + endTime * 60 * 1000);
        endDateTime.setSeconds(0);
        endDateTime.setMilliseconds(0);
        const isoString = endDateTime.toISOString().replace(/\.\d{3}Z$/, 'Z');
        setCachedEndTimeISO(isoString);
    }, []);

    // Initialize idle time immediately and update every second
    useEffect(() => {
        // Calculate initial idle time immediately
        if (brainState?.last_session?.end_ts) {
            const now = new Date();
            const lastSessionEnd = new Date(brainState.last_session.end_ts);
            const idleSeconds = Math.floor((now.getTime() - lastSessionEnd.getTime()) / 1000);
            setIdleTime(Math.max(0, idleSeconds));
        }

        // Update idle time every second
        const interval = setInterval(() => {
            if (brainState?.last_session?.end_ts) {
                const now = new Date();
                const lastSessionEnd = new Date(brainState.last_session.end_ts);
                const idleSeconds = Math.floor((now.getTime() - lastSessionEnd.getTime()) / 1000);
                setIdleTime(Math.max(0, idleSeconds));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [brainState?.last_session?.end_ts]);

    useEffect(() => {
        const abortController = new AbortController();

        const fetchRecommendedTasks = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await authFetch("/api/v1/tasks/recommend", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    signal: abortController.signal,
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch tasks: ${response.statusText}`);
                }

                const data = await response.json();
                setTasks(data);
            } catch (err) {
                if (err instanceof Error && err.name !== "AbortError") {
                    setError(err instanceof Error ? err.message : "Failed to load tasks");
                    console.error("Error fetching recommended tasks:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        if (account) {
            fetchRecommendedTasks();
        }

        return () => abortController.abort();
    }, [account]);

    const handleStartSession = async () => {
        if (!selectedTask || !cachedEndTimeISO) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await authFetch("/api/v1/start_session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    task_name: selectedTask,
                    end_ts: cachedEndTimeISO,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to start session: ${response.statusText}`);
            }

            const data = await response.json();
            
            setSelectedTask("");
            setEndTime(30);
            
            if (onSessionStarted && data.new_brain_state) {
                onSessionStarted(data.new_brain_state);
            }
            
            console.log("Session started successfully");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to start session");
            console.error("Error starting session:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Start a new session</Typography>
                        {brainState?.last_session?.end_ts && (
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Idle for: {formatIdleTime(idleTime)}
                            </Typography>
                        )}
                    </Stack>

                    {error && <Typography color="error">{error}</Typography>}

                    <FormControl fullWidth disabled={loading}>
                        <InputLabel id="idle-task-label">Task</InputLabel>
                        <Select
                            labelId="idle-task-label"
                            value={selectedTask}
                            onChange={(e) => setSelectedTask(e.target.value)}
                            label="Task"
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {tasks.map((task) => {
                                const completedEffort = (task.desired_effort * task.current_percent_effort) / 100;
                                return (
                                    <MenuItem key={task.task_name} value={task.task_name}>
                                        {task.task_name} ({completedEffort % 1 === 0 ? completedEffort.toFixed(0) : completedEffort.toFixed(1)}/{task.desired_effort})
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>

                    <Stack direction="row" spacing={2}>
                        <Stack sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: "text.secondary", mb: 1 }}>
                                Duration (minutes)
                            </Typography>
                            <NumberSpinner
                                value={endTime}
                                onChange={handleEndTimeChange}
                            />
                        </Stack>
                        <Stack sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: "text.secondary", mb: 1 }}>
                                End time
                            </Typography>
                            <Typography variant="body1">
                                {displayEndTime}
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: "center" }}>
                <Button 
                    size="large" 
                    variant="contained" 
                    disabled={loading || !selectedTask || isSubmitting}
                    onClick={handleStartSession}
                >
                    {isSubmitting ? "Starting..." : "Start Session"}
                </Button>
            </CardActions>
        </Card>
    );
}
