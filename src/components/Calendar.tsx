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
import { doc, setDoc, collection } from "firebase/firestore";
import { useContext } from "react";
import { Context } from "../context/AuthContext";

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
    start: new Date(event?.start ?? new Date()),
    end: new Date(event?.end ?? new Date()),
  }));
};

const generateId = () => (Math.floor(Math.random() * 10000) + 1).toString();

const DragAndDropCalendar = withDragAndDrop(Calendar);

const BlockCalendar = () => {
  const childRef = useRef<EditorHandle>(null);
  const { mode } = useColorScheme();
  const { user } = useContext(Context);

  const [events, setEvents] = useState<EventInfo[] | []>(() => {
    // Get the initial state from localStorage
    const savedEvents = localStorage.getItem("events");
    const parsedEvents = savedEvents ? JSON.parse(savedEvents) : [];
    return parseEvents(parsedEvents);
  });

  const [selected, setSelected] = useState<EventInfo | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Save the user object to localStorage whenever it changes
    localStorage.setItem("events", JSON.stringify(events || []));
    saveToFirestore(events);
  }, [events]);

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

  const moveEvent = useCallback(
    ({
      event,
      start,
      end,
      isAllDay: droppedOnAllDaySlot = false,
    }: EventInteractionArgs<EventInfo>) => {
      console.log("🚀 ~ BlockCalendar ~ event:", event);
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
      const d = dayjs.duration(dayjs(end).diff(dayjs(start)));
      const hours = d.asHours();
      let allDay = false;

      if (hours >= 24) {
        allDay = true;
      }
      if (action === "click") {
        return;
      }
      const id = generateId();
      setEvents((prev) => [
        ...prev,
        { start, end, title: "New Event", id, allDay: allDay },
      ]);
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

  const saveToFirestore = useCallback(
    async (events: EventInfo[]) => {
      if (!user) {
        return;
      }
      try {
        const adminEmail = import.meta.env.VITE_FIREBASE_ADMIN_EMAIL;
        // Admin users save to a global events collection
        if (adminEmail === user.email) {
          const globalEventsRef = doc(collection(db, "globalEvents"), "shared");
          await setDoc(globalEventsRef, { events }, { merge: true });
        } else {
          // Regular users save to their personal events collection
          const userEventsRef = doc(collection(db, "userEvents"), user.uid);
          await setDoc(userEventsRef, { events }, { merge: true });
        }
      } catch (error) {
        console.error("Error saving events:", error);
      }
    },
    [user]
  );

  if (!mode) {
    return <></>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" gap={2} p={6}>
        <Box flex={1} height={"70vh"}>
          <DragAndDropCalendar
            defaultView={Views.WEEK}
            views={views}
            events={events}
            localizer={localizer}
            resizable
            popup
            selectable={"ignoreEvents"}
            onSelectEvent={handleSelectEvent}
            onEventDrop={moveEvent}
            onEventResize={resizeEvent}
            onSelectSlot={handleSelectSlot}
            eventPropGetter={eventPropGetter}
            selected={selected}
            allDayAccessor={(event: EventInfo) => {
              return !!event.allDay;
            }}
          />
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
