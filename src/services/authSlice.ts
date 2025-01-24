import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { RootState } from "../store/store";

interface AuthState {
  user: User | null;
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

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  const auth = getAuth();
  await signOut(auth);
});

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
    providerData: user?.providerData,
  };
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
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
        console.log("🚀 ~ .addCase ~ state.user:", state.user);
      });
  },
});

export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;
