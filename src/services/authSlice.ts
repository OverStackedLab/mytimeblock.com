import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { RootState } from "../store/store";

type AuthState = {
  user: {
    email: string | null | undefined;
    uid: string;
    displayName: string | null | undefined;
    photoURL: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
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
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return {
      email: userCredential.user.email,
      uid: userCredential.user.uid,
      displayName: userCredential.user.displayName,
      photoURL: userCredential.user.photoURL,
      emailVerified: userCredential.user.emailVerified,
      isAnonymous: userCredential.user.isAnonymous,
    };
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    const auth = getAuth();
    await signOut(auth);

    // Reset all slices
    dispatch(resetState()); // auth reset
    // dispatch({ type: "calendar/resetState" });
    // dispatch({ type: "preferences/resetState" });
    // dispatch({ type: "pomodoro/resetState" });
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
        state.user = {
          email: action.payload.email,
          uid: action?.payload?.uid || "",
          displayName: action.payload.displayName,
          photoURL: action.payload.photoURL,
          emailVerified: action.payload.emailVerified,
          isAnonymous: action.payload.isAnonymous,
        };
      });
  },
});

export const selectAuth = (state: RootState) => state.auth;
export const { resetState } = authSlice.actions;
export default authSlice.reducer;
