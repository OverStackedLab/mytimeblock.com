import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CalendarEvent, CalendarState } from "../@types/Events";
import { supabase } from "../supabase/config";
import { RootState } from "../store/store";
import type { Event as DbEvent } from "../supabase/types";

// Helper to map database event to CalendarEvent
const mapDbEventToCalendarEvent = (dbEvent: DbEvent): CalendarEvent => ({
  id: dbEvent.id,
  title: dbEvent.title,
  start: dbEvent.start_time,
  end: dbEvent.end_time || undefined,
  backgroundColor: dbEvent.background_color,
  allDay: dbEvent.all_day,
  extendedProps: {
    description: dbEvent.description,
  },
});

export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (userId: string) => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", userId)
      .order("start_time", { ascending: true });

    if (error) throw error;

    return (data || []).map(mapDbEventToCalendarEvent);
  }
);

export const setEvents = createAsyncThunk(
  "events/setEvents",
  async ({ events, userId }: { events: CalendarEvent[]; userId: string }) => {
    // Delete all existing events for user
    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("user_id", userId);

    if (deleteError) throw deleteError;

    // Insert all new events
    if (events.length > 0) {
      const dbEvents = events.map((event) => ({
        id: event.id,
        user_id: userId,
        title: event.title,
        start_time: event.start as string,
        end_time: (event.end as string) || null,
        all_day: event.allDay || false,
        background_color: event.backgroundColor || "#f57c00",
        description: event.extendedProps?.description || "",
      }));

      const { error: insertError } = await supabase
        .from("events")
        .insert(dbEvents);

      if (insertError) throw insertError;
    }

    return events;
  }
);

export const addEvent = createAsyncThunk(
  "events/addEvent",
  async ({ event, userId }: { event: CalendarEvent; userId: string }) => {
    const { error } = await supabase.from("events").insert({
      id: event.id,
      user_id: userId,
      title: event.title,
      start_time: event.start as string,
      end_time: (event.end as string) || null,
      all_day: event.allDay || false,
      background_color: event.backgroundColor || "#f57c00",
      description: event.extendedProps?.description || "",
    });

    if (error) throw error;
    return event;
  }
);

export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async ({ event, userId }: { event: CalendarEvent; userId: string }) => {
    const { error } = await supabase
      .from("events")
      .update({
        title: event.title,
        start_time: event.start as string,
        end_time: (event.end as string) || null,
        all_day: event.allDay || false,
        background_color: event.backgroundColor,
        description: event.extendedProps?.description || "",
      })
      .eq("id", event.id)
      .eq("user_id", userId);

    if (error) throw error;
    return event;
  }
);

export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async ({ event, userId }: { event: CalendarEvent; userId: string }) => {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", event.id)
      .eq("user_id", userId);

    if (error) throw error;
    return event;
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
    // Real-time event handlers
    eventAdded: (state, action: PayloadAction<DbEvent>) => {
      const event = mapDbEventToCalendarEvent(action.payload);
      // Avoid duplicates
      if (!state.events.find((e) => e.id === event.id)) {
        state.events.push(event);
      }
    },
    eventUpdated: (state, action: PayloadAction<DbEvent>) => {
      const event = mapDbEventToCalendarEvent(action.payload);
      const index = state.events.findIndex((e) => e.id === event.id);
      if (index !== -1) {
        state.events[index] = event;
      }
    },
    eventDeleted: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter((e) => e.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        // Only add if not already present (might be added by realtime)
        if (!state.events.find((e) => e.id === action.payload.id)) {
          state.events.push(action.payload);
        }
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.events.findIndex(
            (event) => event.id === action.payload.id
          );
          if (index !== -1) {
            state.events[index] = action.payload;
          }
        }
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter(
          (event) => event.id !== action.payload.id
        );
      })
      .addCase(setEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      });
  },
});

export const { resetState, eventAdded, eventUpdated, eventDeleted } =
  calendarSlice.actions;

export const calendar = (state: RootState) => state.calendar;
export default calendarSlice.reducer;
