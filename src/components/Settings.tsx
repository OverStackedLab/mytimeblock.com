import CheckIcon from "@mui/icons-material/Check";
import CircleIcon from "@mui/icons-material/Circle";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  red,
  orange,
  yellow,
  green,
  blue,
  purple,
  grey,
  brown,
  pink,
  deepOrange,
  deepPurple,
  blueGrey,
} from "@mui/material/colors";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { v4 as uuidv4 } from "uuid";
import { Category } from "../@types/Events";
import { auth } from "../firebase/config";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSlector";
import {
  addCategory,
  deleteCategory,
  fetchCategories,
  selectCategories,
  updateCategory,
} from "../services/categoriesSlice";
import {
  calendar,
  updateEventInFirebase,
} from "../services/calendarSlice";
import Header from "./Header";

const categoryColors = [
  red[500],
  orange[700],
  yellow[600],
  green[500],
  blue[500],
  purple[400],
  grey[500],
  brown[600],
  pink[500],
  deepOrange[700],
  deepPurple[500],
  blueGrey[500],
];

export default function Settings() {
  const [user] = useAuthState(auth);
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector(selectCategories);
  const { events } = useAppSelector(calendar);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(orange[700]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchCategories(user.uid));
    }
  }, [user?.uid, dispatch]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !user?.uid) return;

    const category: Category = {
      id: uuidv4(),
      name: newName.trim(),
      color: newColor,
    };

    await dispatch(addCategory({ category, userId: user.uid }));
    setNewName("");
    setNewColor(orange[700]);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!user?.uid) return;

    // Clear categoryId from affected events
    const affectedEvents = events.filter((e) => e.categoryId === categoryId);
    for (const event of affectedEvents) {
      const { categoryId: _, ...eventWithoutCategory } = event;
      await dispatch(
        updateEventInFirebase({
          event: eventWithoutCategory,
          userId: user.uid,
        })
      );
    }

    await dispatch(deleteCategory({ categoryId, userId: user.uid }));
  };

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("");
  };

  const handleSaveEdit = async (category: Category) => {
    if (!user?.uid || !editName.trim()) return;

    const updated: Category = {
      ...category,
      name: editName.trim(),
      color: editColor,
    };

    await dispatch(updateCategory({ category: updated, userId: user.uid }));
    setEditingId(null);
    setEditName("");
    setEditColor("");
  };

  return (
    <div className="dashboard">
      <Header />
      <main>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your event categories
            </Typography>
          </Box>

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Categories
            </Typography>
            <form onSubmit={handleAddCategory}>
              <Box sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="New category name..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ minWidth: 200, color: "white" }}
                >
                  Add
                </Button>
              </Box>
              <RadioGroup
                row
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                sx={{ mb: 2 }}
              >
                {categoryColors.map((color) => (
                  <Radio
                    key={color}
                    value={color}
                    icon={<CircleIcon sx={{ color }} />}
                    checkedIcon={
                      <CircleIcon
                        sx={{
                          color,
                          outline: "2px solid",
                          outlineColor: color,
                          outlineOffset: 2,
                          borderRadius: "50%",
                        }}
                      />
                    }
                    sx={{ p: 0.5 }}
                  />
                ))}
              </RadioGroup>
            </form>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : categories.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No categories yet. Add one above to get started!
                </Typography>
              </Box>
            ) : (
              <List>
                {categories.map((category) => (
                  <ListItem
                    key={category.id}
                    secondaryAction={
                      editingId === category.id ? (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            edge="end"
                            aria-label="save"
                            onClick={() => handleSaveEdit(category)}
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
                            onClick={() => handleStartEdit(category)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteCategory(category.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )
                    }
                    disablePadding
                    sx={{ px: 2, py: 1 }}
                  >
                    {editingId === category.id ? (
                      <Box sx={{ flex: 1, mr: 8 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveEdit(category);
                            } else if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                          autoFocus
                          sx={{ mb: 1 }}
                        />
                        <RadioGroup
                          row
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                        >
                          {categoryColors.map((color) => (
                            <Radio
                              key={color}
                              value={color}
                              icon={<CircleIcon sx={{ color, fontSize: 18 }} />}
                              checkedIcon={
                                <CircleIcon
                                  sx={{
                                    color,
                                    fontSize: 18,
                                    outline: "2px solid",
                                    outlineColor: color,
                                    outlineOffset: 2,
                                    borderRadius: "50%",
                                  }}
                                />
                              }
                              sx={{ p: 0.25 }}
                            />
                          ))}
                        </RadioGroup>
                      </Box>
                    ) : (
                      <>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CircleIcon sx={{ color: category.color }} />
                        </ListItemIcon>
                        <ListItemText primary={category.name} />
                      </>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {categories.length} categor
              {categories.length !== 1 ? "ies" : "y"}
            </Typography>
          </Box>
        </Container>
      </main>
    </div>
  );
}
