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
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useAuth } from "../context/AuthContext";
import { fetchTasks, addTask, editTask, Task as ApiTask } from "../utils/tasks";
import { useRouter } from "next/navigation";

interface Task {
  task_name: string;
  hours_per_week: number;
}

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
      setNewTaskHours(0.5);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2} maxWidth={600} margin="32px auto">
      <Card variant="outlined" sx={{ width: "100%", maxWidth: 600 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Account
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">{account?.name}</Typography>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              Log out
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Card variant="outlined" sx={{ width: "100%", maxWidth: 600 }}>
        <CardContent>
          <Typography variant="subtitle1" color="textSecondary">
            Manage Tasks
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "66.66%" }}>Task Name</TableCell>
                  <TableCell sx={{ width: "33.33%" }}>Hours/Week</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task, idx) => (
                  <TableRow key={task.task_name}>
                    <TableCell sx={{ width: "66.66%" }}>
                      <TextField
                        value={task.task_name}
                        size="small"
                        fullWidth
                        disabled
                      />
                    </TableCell>
                    <TableCell sx={{ width: "33.33%" }}>
                      <Select
                        value={task.hours_per_week}
                        onChange={(e) =>
                          handleTaskHoursChange(idx, Number(e.target.value))
                        }
                        size="small"
                        fullWidth
                        displayEmpty
                        sx={{ minWidth: 80 }}
                        disabled={loading}
                      >
                        {/* 0.5 to 5, step 0.5 */}
                        {Array.from(
                          { length: 10 },
                          (_, i) => 0.5 + i * 0.5,
                        ).map((val) => (
                          <MenuItem key={val} value={val}>
                            {val}
                          </MenuItem>
                        ))}
                        {/* 6 to 10, step 1 */}
                        {Array.from({ length: 5 }, (_, i) => 5 + (i + 1)).map(
                          (val) => (
                            <MenuItem key={val} value={val}>
                              {val}
                            </MenuItem>
                          ),
                        )}
                        {/* 12 to 20, step 2 */}
                        {Array.from(
                          { length: 5 },
                          (_, i) => 10 + (i + 1) * 2,
                        ).map((val) => (
                          <MenuItem key={val} value={val}>
                            {val}
                          </MenuItem>
                        ))}
                        {/* 25 to 40, step 5 */}
                        {Array.from(
                          { length: 4 },
                          (_, i) => 20 + (i + 1) * 5,
                        ).map((val) => (
                          <MenuItem key={val} value={val}>
                            {val}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack direction="row" spacing={2} alignItems="center" mt={2}>
            <TextField
              label="Task name"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              size="small"
              fullWidth
              disabled={loading}
            />
            <Select
              value={newTaskHours}
              onChange={(e) => setNewTaskHours(Number(e.target.value))}
              size="small"
              sx={{ minWidth: 80 }}
              disabled={loading}
            >
              {/* 0.5 to 5, step 0.5 */}
              {Array.from({ length: 10 }, (_, i) => 0.5 + i * 0.5).map(
                (val) => (
                  <MenuItem key={val} value={val}>
                    {val}
                  </MenuItem>
                ),
              )}
              {/* 6 to 10, step 1 */}
              {Array.from({ length: 5 }, (_, i) => 5 + (i + 1)).map((val) => (
                <MenuItem key={val} value={val}>
                  {val}
                </MenuItem>
              ))}
              {/* 12 to 20, step 2 */}
              {Array.from({ length: 5 }, (_, i) => 10 + (i + 1) * 2).map(
                (val) => (
                  <MenuItem key={val} value={val}>
                    {val}
                  </MenuItem>
                ),
              )}
              {/* 25 to 40, step 5 */}
              {Array.from({ length: 4 }, (_, i) => 20 + (i + 1) * 5).map(
                (val) => (
                  <MenuItem key={val} value={val}>
                    {val}
                  </MenuItem>
                ),
              )}
            </Select>
            <Button
              onClick={handleAddTask}
              variant="outlined"
              disabled={loading || !newTaskName.trim()}
            >
              Add Task
            </Button>
          </Stack>
          {error && (
            <Typography color="error" mt={1}>
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default AccountPage;
