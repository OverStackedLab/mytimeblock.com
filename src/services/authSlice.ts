import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../supabase/config";
import { RootState } from "../store/store";

type AuthState = {
  user: {
    email: string | null | undefined;
    uid: string;
    displayName: string | null | undefined;
    photoURL: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    isAdmin: boolean;
  } | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch profile for admin status
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, display_name, photo_url")
      .eq("id", data.user.id)
      .single();

    return {
      email: data.user.email,
      uid: data.user.id,
      displayName: profile?.display_name || null,
      photoURL: profile?.photo_url || null,
      emailVerified: data.user.email_confirmed_at !== null,
      isAnonymous: false,
      isAdmin: profile?.is_admin || false,
    };
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Reset all slices
    dispatch(resetState());
  }
);

export const initializeAuth = createAsyncThunk("auth/initialize", async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  // Fetch profile for admin status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, display_name, photo_url")
    .eq("id", session.user.id)
    .single();

  return {
    email: session.user.email,
    uid: session.user.id,
    displayName: profile?.display_name || null,
    photoURL: profile?.photo_url || null,
    emailVerified: session.user.email_confirmed_at !== null,
    isAnonymous: false,
    isAdmin: profile?.is_admin || false,
  };
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          email: action.payload.email,
          uid: action.payload.uid || "",
          displayName: action.payload.displayName,
          photoURL: action.payload.photoURL,
          emailVerified: action.payload.emailVerified,
          isAnonymous: action.payload.isAnonymous,
          isAdmin: action.payload.isAdmin,
        };
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login failed";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = {
            email: action.payload.email,
            uid: action.payload.uid || "",
            displayName: action.payload.displayName,
            photoURL: action.payload.photoURL,
            emailVerified: action.payload.emailVerified,
            isAnonymous: action.payload.isAnonymous,
            isAdmin: action.payload.isAdmin,
          };
        }
      });
  },
});

export const selectAuth = (state: RootState) => state.auth;
export const { resetState } = authSlice.actions;
export default authSlice.reducer;
