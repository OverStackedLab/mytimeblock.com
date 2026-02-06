import {
  configureStore,
  ThunkAction,
  Action,
  combineReducers,
} from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import calendarSlice from "../services/calendarSlice";
import authReducer from "../services/authSlice";
import preferencesReducer from "../services/preferencesSlice";
import pomodoroReducer from "../services/pomodoroSlice";
import todoReducer from "../services/todoSlice";

const persistConfig = {
  key: "root",
  version: 1.5,
  storage,
  whitelist: ["auth", "calendar", "preferences", "pomodoro", "todos"],
};

const rootReducer = combineReducers({
  calendar: calendarSlice,
  auth: authReducer,
  preferences: preferencesReducer,
  pomodoro: pomodoroReducer,
  todos: todoReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
