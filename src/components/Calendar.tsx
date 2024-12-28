import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import {
  dayjsLocalizer,
  Calendar,
  Views,
  type Event,
} from "react-big-calendar";
import withDragAndDrop, {
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
// When using `Day.js`
import dayjs from "dayjs";
// and, for optional time zone support
import timezone from "dayjs/plugin/timezone";
import duration from "dayjs/plugin/duration";
import customParseFormat from "dayjs/plugin/customParseFormat";
import EventEditor, { EditorHandle } from "./EventEditor";
import Box from "@mui/material/Box";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SideBar from "./SideBar";
import { useColorScheme } from "@mui/material/styles";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { useContext } from "react";
import { Context } from "../context/AuthContext";
import { Timestamp } from "firebase/firestore";
import { MenuItem, Menu, Typography } from "@mui/material";

dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(customParseFormat);

// end optional time zone support

// Note that the dayjsLocalizer extends Day.js with the following plugins:
// - IsBetween
// - IsSameOrAfter
// - IsSameOrBefore
// - LocaleData
// - LocalizedFormat
// - MinMax
// - UTC

export type EventInfo = Event & {
  id?: string;
  description?: string;
  color?: string;
  userId?: string;
};

const parseEvents = (events: EventInfo[]): EventInfo[] => {
  return events.map((event) => ({
    ...event,
    start:
      event.start instanceof Timestamp
        ? event.start.toDate()
        : new Date(event.start || new Date()),
    end:
      event.end instanceof Timestamp
        ? event.end.toDate()
        : new Date(event.end || new Date()),
  }));
};

const generateId = () => (Math.floor(Math.random() * 10000) + 1).toString();

const DragAndDropCalendar = withDragAndDrop(Calendar);

const BlockCalendar = () => {
  const childRef = useRef<EditorHandle>(null);
  const { mode } = useColorScheme();
  const { user } = useContext(Context);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const handleContextMenu = (
    mouseEvent: React.MouseEvent,
    event: EventInfo
  ) => {
    mouseEvent.preventDefault();
    setSelected(event);
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: mouseEvent.clientX + 2,
            mouseY: mouseEvent.clientY - 6,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null
    );
  };

  const [events, setEvents] = useState<EventInfo[] | []>([]);

  const [selected, setSelected] = useState<EventInfo | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const adminEmail = import.meta.env.VITE_FIREBASE_ADMIN_EMAIL;

  // Replace the existing events initialization with this useEffect
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;

      try {
        if (adminEmail === user.email) {
          const userEventsRef = doc(collection(db, "userEvents"), user.uid);
          const docSnap = await getDoc(userEventsRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setEvents(parseEvents(data.events || []));
          }
        } else {
          const savedEvents = localStorage.getItem("events");
          const parsedEvents = savedEvents ? JSON.parse(savedEvents) : [];
          setEvents(parseEvents(parsedEvents || []));
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [user]);

  const toggleSidebar = (newOpen: boolean) => () => {
    setIsSidebarOpen(newOpen);
  };

  const localizer = useMemo(() => dayjsLocalizer(dayjs), []);
  const { views } = useMemo(
    () => ({
      views: [Views.MONTH, Views.WEEK, Views.DAY],
    }),
    []
  );

  const components = useMemo(
    () => ({
      event: ({ event }: { event: EventInfo }) => {
        return (
          <Box
            onContextMenu={(mouseEvent) => handleContextMenu(mouseEvent, event)}
            style={{ cursor: "context-menu" }}
            height={"100%"}
          >
            <Typography variant="subtitle1" sx={{ lineHeight: 1 }}>
              {event.title}
            </Typography>
          </Box>
        );
      },
    }),
    []
  );

  const moveEvent = useCallback(
    ({
      event,
      start,
      end,
      isAllDay: droppedOnAllDaySlot = false,
    }: EventInteractionArgs<EventInfo>) => {
      let eventStartTime = dayjs(start);
      let eventEndTime = dayjs(end);

      if (!event.allDay && droppedOnAllDaySlot) {
        event.allDay = true;
        // Set start time to midnight of the start day
        eventStartTime = eventStartTime.startOf("day");
        // Set end time to midnight of the next day
        eventEndTime = eventStartTime.add(1, "day");
      }

      if (event.allDay && droppedOnAllDaySlot) {
        event.allDay = true;
        // Set start time to midnight of the start day
        eventStartTime = eventStartTime.startOf("day");
        // Set end time to midnight of the next day
        eventEndTime = eventStartTime.add(1, "day");
      }

      if (event.allDay && !droppedOnAllDaySlot) {
        event.allDay = false;
        eventEndTime = eventStartTime
          .set("year", eventStartTime.year())
          .set("month", eventStartTime.month())
          .set("date", eventStartTime.date())
          .add(30, "minute");
      }

      setEvents((prev) => {
        const existing = prev.find((ev) => ev.id === event.id) ?? {};
        const filtered = prev.filter((ev) => ev.id !== event.id);
        return [
          ...filtered,
          {
            ...existing,
            start: eventStartTime.toDate(),
            end: eventEndTime.toDate(),
            allDay: event.allDay,
          },
        ];
      });
    },
    [setEvents]
  );

  const resizeEvent = useCallback(
    ({ event, start, end }: EventInteractionArgs<EventInfo>) => {
      setEvents((prev) => {
        const existing = prev.find((ev) => ev.id === event.id) ?? {};
        const filtered = prev.filter((ev) => ev.id !== event.id);
        return [
          ...filtered,
          { ...existing, start: new Date(start), end: new Date(end) },
        ];
      });
    },
    [setEvents]
  );

  const eventPropGetter = useCallback((event: EventInfo) => {
    return {
      ...(event.color && {
        style: {
          backgroundColor: event.color,
        },
      }),
    };
  }, []);

  const handleSelectSlot = useCallback(
    ({ start, end, action }: { start: Date; end: Date; action: string }) => {
      setSelected(null);
      const dateDiff = dayjs.duration(dayjs(end).diff(dayjs(start)));
      const hours = dateDiff.asHours();
      let allDay = false;

      if (hours >= 24) {
        allDay = true;
      }
      if (action === "click") {
        return;
      }
      const id = generateId();
      setEvents((prev) => {
        const newEvents = [
          ...prev,
          { start, end, title: "New Event", id, allDay: allDay },
        ];
        return newEvents;
      });
    },
    [setEvents]
  );

  const handleSelectEvent = useCallback((event: EventInfo) => {
    setIsSidebarOpen(true);
    childRef.current?.updateEvent(event);
    childRef.current?.focusField("eventTitle");
    setSelected(event);
  }, []);

  const handleDeleteEvent = useCallback((eventId: string) => {
    setEvents((prev) => {
      const filtered = prev.filter((event) => event.id !== eventId);
      return filtered;
    });
    setIsSidebarOpen(false);
  }, []);

  const setEvent = useCallback((event: EventInfo) => {
    setEvents((prev) => {
      const existing = prev.find((ev) => ev.id === event.id) ?? {};
      const filtered = prev.filter((ev) => ev.id !== event.id);
      return [
        ...filtered,
        {
          ...existing,
          start: event.start,
          end: event.end,
          title: event.title,
          description: event.description,
          color: event.color,
        },
      ];
    });
    setIsSidebarOpen(false);
  }, []);

  const saveEvents = useCallback(
    async (eventsToSave: EventInfo[]) => {
      if (!user) return;

      try {
        const adminEmail = import.meta.env.VITE_FIREBASE_ADMIN_EMAIL;
        if (adminEmail === user.email) {
          // Save to Firebase if admin
          const userEventsRef = doc(collection(db, "userEvents"), user.uid);
          await setDoc(
            userEventsRef,
            { events: eventsToSave },
            { merge: true }
          );
        } else {
          // Save to localStorage if not admin
          localStorage.setItem("events", JSON.stringify(eventsToSave));
        }
      } catch (error) {
        console.error("Error saving events:", error);
      }
    },
    [user]
  );

  // Add this useEffect to save events whenever they change
  useEffect(() => {
    if (events.length > 0) {
      saveEvents(events);
    }
  }, [events, saveEvents]);

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleDuplicate = () => {
    if (selected) {
      const newEvent = {
        ...selected,
        id: generateId(),
        start: dayjs(selected.start).add(1, "day").toDate(),
        end: dayjs(selected.end).add(1, "day").toDate(),
      };
      setEvents((prev) => [...prev, newEvent]);
    }
    handleClose();
  };

  if (!mode) {
    return <></>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" gap={2} p={6}>
        <Box flex={1} height={"80vh"}>
          <DragAndDropCalendar
            defaultView={Views.WEEK}
            views={views}
            events={events}
            localizer={localizer}
            resizable
            selectable={"ignoreEvents"}
            onSelectEvent={handleSelectEvent}
            onEventDrop={moveEvent}
            onEventResize={resizeEvent}
            onSelectSlot={handleSelectSlot}
            eventPropGetter={eventPropGetter}
            selected={selected}
            scrollToTime={dayjs().toDate()}
            components={components}
          />
          <Menu
            open={contextMenu !== null}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
              contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }
          >
            <MenuItem onClick={handleDuplicate}>Duplicate</MenuItem>
          </Menu>
        </Box>
        <SideBar open={isSidebarOpen} onClose={toggleSidebar(false)}>
          <EventEditor
            ref={childRef}
            closeEditor={toggleSidebar(false)}
            setEvent={setEvent}
            deleteEvent={handleDeleteEvent}
          />
        </SideBar>
      </Box>
    </LocalizationProvider>
  );
};

export default BlockCalendar;
