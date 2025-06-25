import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import { Avatar, Box, IconButton, Tooltip, Typography } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { useContext } from "react";
import { CalendarEvent } from "../@types/Events";
import { Context } from "../context/AuthContext";
import { db } from "../firebase/config";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSlector";
import { calendar, migrateEvents, setEvents } from "../services/calendarSlice";

const adminEmails = import.meta.env.VITE_FIREBASE_ADMIN_EMAIL.split(",");

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
              if (adminEmails.includes(user?.email || "")) {
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
            <Box
              sx={{
                color: "primary.main",
                "&::after": {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  animation: "ripple 1.2s infinite ease-in-out",
                  border: "2px solid currentColor",
                  content: '""',
                },
                "@keyframes ripple": {
                  "0%": {
                    transform: "scale(.8)",
                    opacity: 1,
                  },
                  "100%": {
                    transform: "scale(1.3)",
                    opacity: 0,
                  },
                },
              }}
            >
              <ArrowCircleDownIcon color="primary" />
            </Box>
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default UserInfo;
