import { CalendarEvent, CalendarState } from "../@types/Events";
import { RootState } from "../store/store";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc, arrayUnion, updateDoc } from "firebase/firestore";

// const adminEmail = import.meta.env.VITE_FIREBASE_ADMIN_EMAIL;

export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (userId: string) => {
    const docRef = doc(db, "events", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().events || [];
    }
    // If the document doesn't exist, create it with an empty events array
    await setDoc(docRef, { events: [] }, { merge: true });
    return [];
  }
);

export const setEvents = createAsyncThunk(
  "events/setEvents",
  async ({ events, userId }: { events: CalendarEvent[]; userId: string }) => {
    const docRef = doc(db, "events", userId);
    await setDoc(docRef, { events }, { merge: true });
    return events;
  }
);

export const addEventToFirebase = createAsyncThunk(
  "events/addEventToFirebase",
  async ({ event, userId }: { event: CalendarEvent; userId: string }) => {
    try {
      const docRef = doc(db, "events", userId);
      await updateDoc(docRef, {
        events: arrayUnion(event),
      });
      return event;
    } catch (error) {
      console.error("Error adding event to Firebase:", error);
      throw error;
    }
  }
);

export const updateEventInFirebase = createAsyncThunk(
  "events/updateEventInFirebase",
  async ({ event, userId }: { event: CalendarEvent; userId: string }) => {
    const docRef = doc(db, "events", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const events = docSnap.data().events || [];

      const index = events.findIndex((e: CalendarEvent) => e.id === event.id);

      if (index !== -1) {
        events[index] = event;

        await updateDoc(docRef, { events });
      }

      return event;
    }
    throw new Error("Document not found");
  }
);

export const deleteEventFromFirebase = createAsyncThunk(
  "events/deleteEventFromFirebase",
  async ({ event, userId }: { event: CalendarEvent; userId: string }) => {
    const docRef = doc(db, "events", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const events = docSnap.data().events || [];

      const index = events.findIndex((e: CalendarEvent) => e.id === event.id);

      if (index !== -1) {
        events.splice(index, 1);
        await updateDoc(docRef, { events });
      }

      return event;
    }
    throw new Error("Document not found");
  }
);

const initialState: CalendarState = {
  events: [],
  loading: false,
  error: null,
};

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(addEventToFirebase.fulfilled, (state, action) => {
        state.events.push(action.payload);
      })
      .addCase(updateEventInFirebase.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.events.findIndex(
            (event) => event.id === action.payload.id
          );
          if (index !== -1) {
            state.events[index] = action.payload;
          }
        }
      })
      .addCase(deleteEventFromFirebase.fulfilled, (state, action) => {
        state.events = state.events.filter(
          (event) => event.id !== action.payload.id
        );
      });
  },
});

export const calendar = (state: RootState) => state.calendar;
export default calendarSlice.reducer;
