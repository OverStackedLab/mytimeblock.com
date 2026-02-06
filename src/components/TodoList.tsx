import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Checkbox,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSlector";
import { auth } from "../firebase/config";
import {
  addTodo,
  deleteTodo,
  fetchTodos,
  selectTodos,
  updateTodo,
} from "../services/todoSlice";
import { Todo } from "../@types/Todo";
import Header from "./Header";

export default function TodoList() {
  const [user] = useAuthState(auth);
  const dispatch = useAppDispatch();
  const { todos, loading } = useAppSelector(selectTodos);
  const [newTodoText, setNewTodoText] = useState("");

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchTodos(user.uid));
    }
  }, [user?.uid, dispatch]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim() || !user?.uid) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText,
      completed: false,
      createdAt: new Date().toISOString(),
      userId: user.uid,
    };

    await dispatch(addTodo({ todo: newTodo, userId: user.uid }));
    setNewTodoText("");
  };

  const handleToggleTodo = async (todo: Todo) => {
    if (!user?.uid) return;

    const updatedTodo = {
      ...todo,
      completed: !todo.completed,
    };

    await dispatch(updateTodo({ todo: updatedTodo, userId: user.uid }));
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (!user?.uid) return;
    await dispatch(deleteTodo({ todoId, userId: user.uid }));
  };

  return (
    <div className="dashboard">
      <Header />
      <main>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              My Tasks
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Keep track of your daily tasks and stay organized
            </Typography>
          </Box>

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <form onSubmit={handleAddTodo}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Add a new task..."
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                sx={{ mb: 2 }}
              />
            </form>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : todos.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No tasks yet. Add one above to get started!
                </Typography>
              </Box>
            ) : (
              <List>
                {todos.map((todo) => (
                  <ListItem
                    key={todo.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteTodo(todo.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                    disablePadding
                  >
                    <ListItemButton
                      onClick={() => handleToggleTodo(todo)}
                      dense
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={todo.completed}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={todo.text}
                        sx={{
                          textDecoration: todo.completed
                            ? "line-through"
                            : "none",
                          color: todo.completed ? "text.secondary" : "text.primary",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {todos.filter((t) => !t.completed).length} task
              {todos.filter((t) => !t.completed).length !== 1 ? "s" : ""} remaining
            </Typography>
          </Box>
        </Container>
      </main>
    </div>
  );
}
