import React, { useState } from "react";
// Removed Dialog imports
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

interface Task {
  name: string;
  hours: number;
}

const AccountSection: React.FC = () => {
  const { account, logout } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleTaskChange = (
    idx: number,
    field: keyof Task,
    value: string | number,
  ) => {
    setTasks((tasks) =>
      tasks.map((task, i) => (i === idx ? { ...task, [field]: value } : task)),
    );
  };

  const handleAddTask = () => {
    setTasks((tasks) => [...tasks, { name: "", hours: 0 }]);
  };

  return (
    <Stack spacing={2} maxWidth={600} margin="32px auto">
      <Typography variant="h4" gutterBottom>
        Account
      </Typography>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
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
      <Typography variant="subtitle1" color="textSecondary">
        Manage Tasks
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Task Name</TableCell>
              <TableCell>Hours/Week</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <TextField
                    value={task.name}
                    onChange={(e) =>
                      handleTaskChange(idx, "name", e.target.value)
                    }
                    placeholder="Task name"
                    size="small"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={task.hours}
                    onChange={(e) =>
                      handleTaskChange(idx, "hours", Number(e.target.value))
                    }
                    size="small"
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button onClick={handleAddTask} variant="outlined" sx={{ mt: 2 }}>
        Add Task
      </Button>
    </Stack>
  );
};

export default AccountSection;
