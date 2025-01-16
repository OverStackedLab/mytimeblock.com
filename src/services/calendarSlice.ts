import { CalendarEvent } from "../@types/Events";
import { RootState } from "../store/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { db } from "../firebase/config";
// import { doc, getDoc, setDoc, collection } from "firebase/firestore";
// import { Timestamp } from "firebase/firestore";
// import { Context } from "../context/AuthContext";

// const adminEmail = import.meta.env.VITE_FIREBASE_ADMIN_EMAIL;

export type CalendarState = {
  events: CalendarEvent[];
};

const initialState: CalendarState = {
  events: [],
};

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setEvents: (state, action) => {
      state.events = action.payload;
    },
    addEvent: (state, action: PayloadAction<CalendarEvent>) => {
      state.events.push(action.payload);
    },
    updateEvent: (state, action: PayloadAction<CalendarEvent>) => {
      const index = state.events.findIndex(
        (event) => event.id === action.payload.id
      );
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    deleteEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(
        (event) => event.id !== action.payload
      );
    },
  },
});

export const { setEvents, updateEvent, deleteEvent, addEvent } =
  calendarSlice.actions;

export const events = (state: RootState) => state.calendar.events;

export default calendarSlice.reducer;
