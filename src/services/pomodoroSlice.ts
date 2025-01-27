import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store/store";

type TimerMode = "focus" | "break" | "longBreak";

interface PomodoroState {
  isRunning: boolean;
  timeLeft: number;
  mode: TimerMode;
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  completedSessions: number;
  totalIntervals: number;
}

const initialState: PomodoroState = {
  isRunning: false,
  timeLeft: 25 * 60, // 25 minutes in seconds
  mode: "focus",
  workDuration: 25 * 60,
  breakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsBeforeLongBreak: 4,
  completedSessions: 0,
  totalIntervals: 12,
};

const pomodoroSlice = createSlice({
  name: "pomodoro",
  initialState,
  reducers: {
    startTimer: (state) => {
      state.isRunning = true;
    },
    pauseTimer: (state) => {
      state.isRunning = false;
    },
    resetTimer: (state) => {
      state.isRunning = false;
      state.timeLeft = state.workDuration;
      state.mode = "focus";
      state.completedSessions = 0;
      state.totalIntervals = initialState.totalIntervals;
    },
    tick: (state) => {
      if (state.timeLeft > 0) {
        state.timeLeft -= 1;
      }
    },
    switchMode: (state) => {
      if (state.mode === "focus") {
        state.completedSessions += 1;

        // Check if all intervals are completed
        if (state.completedSessions >= state.totalIntervals) {
          state.isRunning = false;
          state.completedSessions = state.totalIntervals;
          return;
        }

        if (state.completedSessions % state.sessionsBeforeLongBreak === 0) {
          state.mode = "longBreak";
          state.timeLeft = state.longBreakDuration;
        } else {
          state.mode = "break";
          state.timeLeft = state.breakDuration;
        }
      } else {
        state.mode = "focus";
        state.timeLeft = state.workDuration;
      }
      state.isRunning = false;
    },
    updateSettings: (
      state,
      action: PayloadAction<{
        workDuration?: number;
        breakDuration?: number;
        longBreakDuration?: number;
        sessionsBeforeLongBreak?: number;
        totalIntervals?: number;
      }>
    ) => {
      if (action.payload.workDuration) {
        state.workDuration = action.payload.workDuration;
        if (state.mode === "focus") {
          state.timeLeft = action.payload.workDuration;
        }
      }
      if (action.payload.breakDuration) {
        state.breakDuration = action.payload.breakDuration;
        if (state.mode === "break") {
          state.timeLeft = action.payload.breakDuration;
        }
      }
      if (action.payload.longBreakDuration) {
        state.longBreakDuration = action.payload.longBreakDuration;
        if (state.mode === "longBreak") {
          state.timeLeft = action.payload.longBreakDuration;
        }
      }
      if (action.payload.sessionsBeforeLongBreak) {
        state.sessionsBeforeLongBreak = action.payload.sessionsBeforeLongBreak;
      }
      if (action.payload.totalIntervals) {
        state.totalIntervals = action.payload.totalIntervals;
      }
    },
    resetSettings: (state) => {
      state.workDuration = initialState.workDuration;
      state.breakDuration = initialState.breakDuration;
      state.longBreakDuration = initialState.longBreakDuration;
      state.sessionsBeforeLongBreak = initialState.sessionsBeforeLongBreak;
      state.totalIntervals = initialState.totalIntervals;
      state.timeLeft = initialState.workDuration;
      state.mode = "focus";
      state.isRunning = false;
      state.completedSessions = 0;
    },
  },
});

export const {
  startTimer,
  pauseTimer,
  resetTimer,
  tick,
  switchMode,
  updateSettings,
  resetSettings,
} = pomodoroSlice.actions;

export const selectPomodoro = (state: RootState) => state.pomodoro;
export default pomodoroSlice.reducer;
