import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

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

  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleSaveEdit = async (todo: Todo) => {
    if (!user?.uid || !editText.trim()) return;

    const updatedTodo = {
      ...todo,
      text: editText.trim(),
    };

    await dispatch(updateTodo({ todo: updatedTodo, userId: user.uid }));
    setEditingId(null);
    setEditText("");
  };

  return (
    <div className="dashboard">
      <Header />
      <main>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              My ToDos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Keep track of your daily tasks and stay organized
            </Typography>
          </Box>

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <form onSubmit={handleAddTodo}>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Add a new todo..."
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ minWidth: 200, color: "white" }}
                >
                  Add
                </Button>
              </Box>
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
                      editingId === todo.id ? (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            edge="end"
                            aria-label="save"
                            onClick={() => handleSaveEdit(todo)}
                            size="small"
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="cancel"
                            onClick={handleCancelEdit}
                            size="small"
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => handleStartEdit(todo)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteTodo(todo.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )
                    }
                    disablePadding
                  >
                    {editingId === todo.id ? (
                      <Box sx={{ flex: 1, px: 2, py: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveEdit(todo);
                            } else if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                          autoFocus
                        />
                      </Box>
                    ) : (
                      <ListItemButton
                        onClick={() => handleToggleTodo(todo)}
                        dense
                        sx={{ alignItems: "flex-start" }}
                      >
                        <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                          <Checkbox
                            edge="start"
                            checked={todo.completed}
                            tabIndex={-1}
                            disableRipple
                            sx={{ p: 0 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={todo.text}
                          secondary={`${new Date(
                            todo.createdAt,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}`}
                          sx={{
                            textDecoration: todo.completed
                              ? "line-through"
                              : "none",
                            color: todo.completed
                              ? "text.secondary"
                              : "text.primary",
                          }}
                        />
                      </ListItemButton>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {todos.filter((t) => !t.completed).length} task
              {todos.filter((t) => !t.completed).length !== 1 ? "s" : ""}{" "}
              remaining
            </Typography>
          </Box>
        </Container>
      </main>
    </div>
  );
}
