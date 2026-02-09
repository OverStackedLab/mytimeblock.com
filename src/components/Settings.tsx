import AddIcon from "@mui/icons-material/Add";
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
import { calendar, updateEventInFirebase } from "../services/calendarSlice";
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
  const [newColor, setNewColor] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const usedColors = new Set(categories.map((c) => c.color));
  const getFirstAvailableColor = (excluded?: string) => {
    const used = excluded ? new Set([...usedColors, excluded]) : usedColors;
    return categoryColors.find((c) => !used.has(c)) ?? "";
  };

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchCategories(user.uid));
    }
  }, [user?.uid, dispatch]);

  useEffect(() => {
    if (!newColor || usedColors.has(newColor)) {
      setNewColor(getFirstAvailableColor());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !user?.uid || usedColors.has(newColor)) return;

    const category: Category = {
      id: uuidv4(),
      name: newName.trim(),
      color: newColor,
    };

    await dispatch(addCategory({ category, userId: user.uid }));
    setNewName("");
    setNewColor(getFirstAvailableColor(newColor));
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!user?.uid) return;

    // Clear categoryId from affected events
    const affectedEvents = events.filter((e) => e.categoryId === categoryId);
    for (const event of affectedEvents) {
      const eventWithoutCategory = { ...event };
      delete eventWithoutCategory.categoryId;
      await dispatch(
        updateEventInFirebase({
          event: eventWithoutCategory,
          userId: user.uid,
        }),
      );
    }

    await dispatch(deleteCategory({ categoryId, userId: user.uid }));
  };

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSaveEdit = async (category: Category) => {
    if (!user?.uid || !editName.trim()) return;

    const updated: Category = {
      ...category,
      name: editName.trim(),
    };

    await dispatch(updateCategory({ category: updated, userId: user.uid }));
    setEditingId(null);
    setEditName("");
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
              Manage your block categories
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{ p: 3, mb: 3, border: 1, borderColor: "divider" }}
          >
            <Typography variant="h6" gutterBottom>
              Categories
            </Typography>
            <form onSubmit={handleAddCategory}>
              <Box
                sx={{ display: "flex", gap: 1, mb: 4, alignItems: "center" }}
              >
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
                  disabled={!newColor || usedColors.has(newColor)}
                  startIcon={<AddIcon />}
                  sx={{
                    minWidth: 160,
                    color: "white",
                    height: 56,
                    fontSize: 16,
                  }}
                  disableElevation
                >
                  Add
                </Button>
              </Box>
              <RadioGroup
                row
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                sx={{ mb: 2, ml: -0.5 }}
              >
                {categoryColors.map((color) => (
                  <Radio
                    key={color}
                    value={color}
                    disabled={usedColors.has(color)}
                    icon={
                      <CircleIcon
                        sx={{
                          color,
                          opacity: usedColors.has(color) ? 0.25 : 1,
                        }}
                      />
                    }
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
              <List sx={{ ml: 0 }}>
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
                    sx={{ py: 1 }}
                  >
                    {editingId === category.id ? (
                      <Box sx={{ flex: 1, px: 2, py: 1 }}>
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
                        />
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
