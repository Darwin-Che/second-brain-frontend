"use client";
import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../context/AuthContext";
import { fetchTasks, addTask, editTask, Task as ApiTask } from "../utils/tasks";
import { useRouter } from "next/navigation";

interface Task {
  task_name: string;
  hours_per_week: number;
}

// Hours per week options: 0-5 step 0.5, 5-10 step 1, 10-40 step 2
const HOURS_PER_WEEK_OPTIONS = [
  0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5,
  6, 7, 8, 9, 10,
  12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40
];

const AccountPage: React.FC = () => {
  const { account, logout } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskHours, setNewTaskHours] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchTasks()
      .then((data) => {
        console.log("Fetched tasks:", data);
        setTasks(data);
      })
      .catch(() => setError("Failed to load tasks"))
      .finally(() => setLoading(false));
  }, []);

  const handleTaskHoursChange = async (idx: number, hours: number) => {
    const task = tasks[idx];
    if (!task) return;
    setLoading(true);
    setError(null);
    try {
      await editTask({ ...task, hours_per_week: hours });
      setTasks((ts) =>
        ts.map((t, i) => (i === idx ? { ...t, hours_per_week: hours } : t)),
      );
    } catch (err: any) {
      setError(err?.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await addTask({
        task_name: newTaskName.trim(),
        hours_per_week: newTaskHours,
      });
      setTasks((ts) => [
        ...ts,
        { task_name: newTaskName.trim(), hours_per_week: newTaskHours },
      ]);
      setNewTaskName("");
      setNewTaskHours(0);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Account Section */}
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0.5}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {account?.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {account?.email}
            </Typography>
          </Stack>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            Logout
          </Button>
        </Stack>
      </Stack>

      {/* Tasks Section */}
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Tasks
        </Typography>

        {/* Tasks Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: "66%" }}>Task Name</TableCell>
                <TableCell sx={{ fontWeight: 600, width: "34%" }}>Hrs / Wk</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task, idx) => (
                <TableRow key={idx}>
                  <TableCell>{task.task_name}</TableCell>
                  <TableCell>
                    <Select
                      value={task.hours_per_week}
                      onChange={(e) =>
                        handleTaskHoursChange(idx, e.target.value as number)
                      }
                      disabled={loading}
                      size="small"
                      fullWidth
                    >
                      {HOURS_PER_WEEK_OPTIONS.map((hours) => (
                        <MenuItem key={hours} value={hours}>
                          {hours}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add Task Form */}
        <Stack direction="row" spacing={2} sx={{ alignItems: "flex-end" }}>
          <TextField
            label="Task Name (Can't Change)"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            disabled={loading}
            sx={{ width: "66%" }}
            size="small"
          />
          <Select
            value={newTaskHours}
            onChange={(e) => setNewTaskHours(e.target.value as number)}
            disabled={loading}
            sx={{ width: "34%", minWidth: "100px" }}
            size="small"
          >
            {HOURS_PER_WEEK_OPTIONS.map((hours) => (
              <MenuItem key={hours} value={hours}>
                {hours}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            onClick={handleAddTask}
            disabled={loading}
            sx={{ ml: "auto", height: "40px", minWidth: "40px", padding: 0 }}
          >
            <AddIcon />
          </Button>
        </Stack>

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export default AccountPage;
