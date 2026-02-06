import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { Todo, TodoState } from "../@types/Todo";
import { db } from "../firebase/config";
import { RootState } from "../store/store";

const auth = getAuth();

export const fetchTodos = createAsyncThunk(
  "todos/fetchTodos",
  async (userId: string) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not found");
    }

    const docRef = doc(db, "todos", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().todos || [];
    }

    // Initialize empty todos array for new users
    await setDoc(docRef, { todos: [] }, { merge: true });
    return [];
  }
);

export const saveTodos = createAsyncThunk(
  "todos/saveTodos",
  async ({ todos, userId }: { todos: Todo[]; userId: string }) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not found");
    }

    const docRef = doc(db, "todos", userId);
    await setDoc(docRef, { todos }, { merge: true });
    return todos;
  }
);

export const addTodo = createAsyncThunk(
  "todos/addTodo",
  async ({ todo, userId }: { todo: Todo; userId: string }) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not found");
    }

    const docRef = doc(db, "todos", userId);
    const docSnap = await getDoc(docRef);

    let todos: Todo[] = [];
    if (docSnap.exists()) {
      todos = docSnap.data().todos || [];
    }

    todos.push(todo);
    await updateDoc(docRef, { todos });
    return todo;
  }
);

export const updateTodo = createAsyncThunk(
  "todos/updateTodo",
  async ({ todo, userId }: { todo: Todo; userId: string }) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not found");
    }

    const docRef = doc(db, "todos", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const todos = docSnap.data().todos || [];
      const index = todos.findIndex((t: Todo) => t.id === todo.id);

      if (index !== -1) {
        todos[index] = todo;
        await updateDoc(docRef, { todos });
      }
      return todo;
    }
    throw new Error("Document not found");
  }
);

export const deleteTodo = createAsyncThunk(
  "todos/deleteTodo",
  async ({ todoId, userId }: { todoId: string; userId: string }) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not found");
    }

    const docRef = doc(db, "todos", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const todos = docSnap.data().todos || [];
      const filteredTodos = todos.filter((t: Todo) => t.id !== todoId);
      await updateDoc(docRef, { todos: filteredTodos });
      return todoId;
    }
    throw new Error("Document not found");
  }
);

const initialState: TodoState = {
  todos: [],
  loading: false,
  error: null,
};

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    resetTodoState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.todos = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(addTodo.fulfilled, (state, action) => {
        state.todos.push(action.payload);
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        const index = state.todos.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.todos[index] = action.payload;
        }
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.todos = state.todos.filter((t) => t.id !== action.payload);
      })
      .addCase(saveTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.todos = action.payload;
      });
  },
});

export const { resetTodoState } = todoSlice.actions;

export const selectTodos = (state: RootState) => state.todos;
export default todoSlice.reducer;
