import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../supabase/config";
import { RootState } from "../store/store";

type PreferencesState = {
  eventSwatches: string[];
  loading: boolean;
  error: string | null;
};

const initialState: PreferencesState = {
  eventSwatches: [],
  loading: false,
  error: null,
};

export const fetchPreferences = createAsyncThunk(
  "preferences/fetch",
  async (userId: string) => {
    const { data, error } = await supabase
      .from("preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    // PGRST116 = row not found, which is ok for new users
    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return {
      eventSwatches: data?.event_swatches || [],
    };
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
    const { error } = await supabase.from("preferences").upsert({
      user_id: userId,
      event_swatches: preferences.eventSwatches || [],
    });

    if (error) throw error;
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
