import { EventInfo } from "../@types/Events";
import { RootState } from "../store";
import { createSlice } from "@reduxjs/toolkit";
// import { db } from "../firebase/config";
// import { doc, getDoc, setDoc, collection } from "firebase/firestore";
// import { Timestamp } from "firebase/firestore";
// import { Context } from "../context/AuthContext";

// const adminEmail = import.meta.env.VITE_FIREBASE_ADMIN_EMAIL;

export type CalendarState = {
  events: EventInfo[];
};

const initialState: CalendarState = {
  events: [],
};

export const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setEvents: (state, action) => {
      // if (adminEmail === user.email) {
      //   const userEventsRef = doc(collection(db, "userEvents"), user.uid);
      //   await setDoc(userEventsRef, { events: eventsToSave }, { merge: true });
      // } else {
      //   localStorage.setItem("events", JSON.stringify(eventsToSave));
      // }
      state.events = action.payload;
    },
  },
});

export const { setEvents } = calendarSlice.actions;

export const events = (state: RootState) => state.calendar.events;

export default calendarSlice.reducer;
