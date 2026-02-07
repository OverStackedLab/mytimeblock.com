import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Category, CategoryState } from "../@types/Events";
import { db } from "../firebase/config";
import { RootState } from "../store/store";

const auth = getAuth();

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (userId: string) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not found");
    }

    const docRef = doc(db, "categories", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().categories || [];
    }

    await setDoc(docRef, { categories: [] }, { merge: true });
    return [];
  }
);

export const addCategory = createAsyncThunk(
  "categories/addCategory",
  async ({ category, userId }: { category: Category; userId: string }) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not found");
    }

    const docRef = doc(db, "categories", userId);
    const docSnap = await getDoc(docRef);

    let categories: Category[] = [];
    if (docSnap.exists()) {
      categories = docSnap.data().categories || [];
    }

    categories.push(category);
    await setDoc(docRef, { categories }, { merge: true });
    return category;
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ category, userId }: { category: Category; userId: string }) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not found");
    }

    const docRef = doc(db, "categories", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const categories = docSnap.data().categories || [];
      const index = categories.findIndex(
        (c: Category) => c.id === category.id
      );

      if (index !== -1) {
        categories[index] = category;
        await updateDoc(docRef, { categories });
      }
      return category;
    }
    throw new Error("Document not found");
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async ({ categoryId, userId }: { categoryId: string; userId: string }) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not found");
    }

    const docRef = doc(db, "categories", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const categories = docSnap.data().categories || [];
      const filteredCategories = categories.filter(
        (c: Category) => c.id !== categoryId
      );
      await updateDoc(docRef, { categories: filteredCategories });
      return categoryId;
    }
    throw new Error("Document not found");
  }
);

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    resetCategoryState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => c.id !== action.payload
        );
      });
  },
});

export const { resetCategoryState } = categoriesSlice.actions;

export const selectCategories = (state: RootState) => state.categories;
export default categoriesSlice.reducer;
