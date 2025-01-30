import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { getAuth } from "firebase/auth";
import { RootState } from "../store/store";

type PreferencesState = {
  eventSwatches: string[];
  loading: boolean;
  error: string | null;
};

const initialState: PreferencesState = {
  eventSwatches: [], // Default orange
  loading: false,
  error: null,
};

export const fetchPreferences = createAsyncThunk(
  "preferences/fetch",
  async (userId: string) => {
    const user = getAuth().currentUser;
    if (user?.email === import.meta.env.VITE_FIREBASE_ADMIN_EMAIL) {
      const docRef = doc(db, "preferences", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      await setDoc(docRef, initialState, { merge: true });
    }
    return initialState;
  }
);

export const updatePreferences = createAsyncThunk(
  "preferences/update",
  async ({
    preferences,
    userId,
  }: {
    preferences: Partial<PreferencesState>;
    userId: string;
  }) => {
    const user = getAuth().currentUser;
    if (user?.email === import.meta.env.VITE_FIREBASE_ADMIN_EMAIL) {
      const docRef = doc(db, "preferences", userId);
      await setDoc(docRef, preferences, { merge: true });
    }
    return preferences;
  }
);

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreferences.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.eventSwatches =
          action.payload.eventSwatches || initialState.eventSwatches;
      })
      .addCase(fetchPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        if (action.payload.eventSwatches) {
          state.eventSwatches = action.payload.eventSwatches;
        }
      });
  },
});

export const { resetState } = preferencesSlice.actions;
export const selectPreferences = (state: RootState) => state.preferences;
export default preferencesSlice.reducer;
