import { Box, IconButton, Avatar, Typography, Tooltip } from "@mui/material";
import { useContext } from "react";
import { Context } from "../context/AuthContext";
import { calendar, migrateEvents } from "../services/calendarSlice";
import { setEvents } from "../services/calendarSlice";
import { CalendarEvent } from "../@types/Events";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSlector";
import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const UserInfo = () => {
  const { user } = useContext(Context);
  const dispatch = useAppDispatch();
  const { events } = useAppSelector(calendar);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
      <Avatar sx={{ bgcolor: "primary.main" }}>
        {user?.email?.[0].toUpperCase() || "?"}
      </Avatar>
      <Typography>{user?.email || "Not signed in"}</Typography>
      <Box>
        <Tooltip title="Click to migrate your timeblocks to the new calendar">
          <IconButton
            onClick={async () => {
              // localStorage.setItem(
              //   "events",
              //   JSON.stringify([
              //     {
              //       start: "2025-01-30T08:30:00.000Z",
              //       end: "2025-01-30T09:00:00.000Z",
              //       title: "New Event",
              //       id: "5518",
              //       allDay: false,
              //     },
              //   ])
              // );
              const adminEmail = import.meta.env.VITE_FIREBASE_ADMIN_EMAIL;

              if (user?.email === adminEmail) {
                const userEventsRef = doc(db, "userEvents", user?.uid || "");
                const userEventsSnap = await getDoc(userEventsRef);

                if (userEventsSnap.exists()) {
                  const migratedEvents = migrateEvents(
                    userEventsSnap.data().events || []
                  );

                  const existingEvents = events.some((event) => {
                    return migratedEvents.some(
                      (userEvent: CalendarEvent) => userEvent.id === event.id
                    );
                  });

                  if (existingEvents) {
                    return;
                  }

                  dispatch(
                    setEvents({
                      events: migratedEvents,
                      userId: user?.uid || "",
                    })
                  );
                }

                return;
              }

              const localEvents = localStorage.getItem("events");
              if (localEvents) {
                const existingEvents = events.some((event) => {
                  return JSON.parse(localEvents).some(
                    (localEvent: CalendarEvent) => localEvent.id === event.id
                  );
                });

                if (existingEvents) {
                  return;
                }

                dispatch(
                  setEvents({
                    events: migrateEvents(JSON.parse(localEvents)),
                    userId: user?.uid || "",
                  })
                );
                // localStorage.removeItem("events");
              }
            }}
            sx={{
              cursor: "pointer",
              textDecoration: "underline",
              border: "none",
              background: "none",
              p: 0,
              color: "text.secondary",
            }}
          >
            <ArrowCircleDownIcon color="primary" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default UserInfo;
