import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  UserMetadata,
} from "firebase/auth";
import { RootState } from "../store/store";

interface AuthState {
  user: {
    email: string | null | undefined;
    uid: string | undefined;
    displayName: string | null | undefined;
    photoURL: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    metadata: UserMetadata | undefined;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) => {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    const auth = getAuth();
    await signOut(auth);
    dispatch(resetState());
    // Clear calendar state too
    dispatch({ type: "calendar/resetState" });
  }
);

export const initializeAuth = createAsyncThunk("auth/initialize", async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  return {
    email: user?.email,
    uid: user?.uid,
    displayName: user?.displayName,
    photoURL: user?.photoURL,
    emailVerified: user?.emailVerified,
    isAnonymous: user?.isAnonymous,
    metadata: user?.metadata,
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
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login failed";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const selectAuth = (state: RootState) => state.auth;
export const { resetState } = authSlice.actions;
export default authSlice.reducer;
