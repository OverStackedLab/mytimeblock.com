import { orange } from "@mui/material/colors";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAuth } from "firebase/auth";
import {
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { CalendarEvent, CalendarState, EventInfo } from "../@types/Events";
import { db } from "../firebase/config";
import { RootState } from "../store/store";

const adminEmails = import.meta.env.VITE_FIREBASE_ADMIN_EMAIL.split(",");

const auth = getAuth();

export const migrateEvents = (oldEvents: EventInfo[]): CalendarEvent[] => {
  return oldEvents.map((event) => {
    let startDate: string;
    let endDate: string;

    if (event?.start instanceof Timestamp) {
      startDate = event.start.toDate().toISOString();
    } else {
      startDate = String(event.start || new Date().toISOString());
    }

    if (event?.end instanceof Timestamp) {
      endDate = event.end.toDate().toISOString();
    } else {
      endDate = String(event.end || startDate);
    }

    return {
      id: String(event.id || ""),
      title: String(event.title || ""),
      start: startDate,
      end: endDate,
      backgroundColor: String(event.color || orange[700]),
      allDay: Boolean(event.allDay),
      extendedProps: {
        description: String(event.description || ""),
      },
    };
  });
};

export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (userId: string) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not found");
    }

    if (adminEmails.includes(user?.email || "")) {
      // Only fetch events if user is admin
      const docRef = doc(db, "events", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data().events || [];
      }

      // Initialize empty events array for new users
      await setDoc(docRef, { events: [] }, { merge: true });

      return [];
    }
    return [];
  }
);

export const setEvents = createAsyncThunk(
  "events/setEvents",
  async ({ events, userId }: { events: CalendarEvent[]; userId: string }) => {
    const user = auth.currentUser;
    if (!user?.email || !adminEmails.includes(user.email)) {
      return events;
    }

    const docRef = doc(db, "events", userId);
    await setDoc(docRef, { events }, { merge: true });
    return events;
  }
);

export const addEventToFirebase = createAsyncThunk(
  "events/addEventToFirebase",
  async ({ event, userId }: { event: CalendarEvent; userId: string }) => {
    const user = auth.currentUser;
    if (!user?.email || !adminEmails.includes(user.email)) {
      return event;
    }

    const docRef = doc(db, "events", userId);
    await updateDoc(docRef, {
      events: arrayUnion(event),
    });
    return event;
  }
);

export const updateEventInFirebase = createAsyncThunk(
  "events/updateEventInFirebase",
  async ({ event, userId }: { event: CalendarEvent; userId: string }) => {
    const user = auth.currentUser;
    if (!user?.email || !adminEmails.includes(user.email)) {
      return event;
    }

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
    const user = auth.currentUser;
    if (!user?.email || !adminEmails.includes(user.email)) {
      return event;
    }
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
  reducers: {
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        // Clear any existing error state
        state.error = null;
        state.events = action.payload;
        const user = auth.currentUser;
        if (adminEmails.includes(user?.email || "")) {
          state.events = action.payload;
        }
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
      })
      .addCase(setEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = [...state.events, ...action.payload];
      });
  },
});

export const { resetState } = calendarSlice.actions;

export const calendar = (state: RootState) => state.calendar;
export default calendarSlice.reducer;
