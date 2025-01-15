import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
  useContext,
} from "react";
import {
  dayjsLocalizer,
  Calendar,
  Views,
  type Event,
  View,
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
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useColorScheme } from "@mui/material/styles";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { Context } from "../context/AuthContext";
import EventEditor, { EditorHandle } from "./EventEditor";
import SideBar from "./SideBar";
import Pomodoro from "./Pomodoro";

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
  const [alertOpen, setAlertOpen] = useState(true);

  const [events, setEvents] = useState<EventInfo[] | []>([]);

  const [selected, setSelected] = useState<EventInfo | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>(Views.WEEK);

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
    // childRef.current?.focusField("eventTitle");
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
        start: dayjs(selected.start).add(1, "hour").toDate(),
        end: dayjs(selected.end).add(1, "hour").toDate(),
      };
      setEvents((prev) => [...prev, newEvent]);
    }
    handleClose();
  };

  const handleViewChange = useCallback(
    (newView: View) => {
      setCurrentView(newView);
    },
    [setCurrentView]
  );

  if (!mode) {
    return <></>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box px={6}>
        <Collapse in={alertOpen}>
          <Alert
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setAlertOpen(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            Double click or drag on a time slot to start creating events!
          </Alert>
        </Collapse>
      </Box>
      <Box display="flex" gap={2} p={6}>
        <Box flex={1} height={"80vh"}>
          <DragAndDropCalendar
            defaultView={Views.WEEK}
            views={views}
            events={events}
            localizer={localizer}
            resizable
            selectable={true}
            onSelectEvent={handleSelectEvent}
            onEventDrop={moveEvent}
            onEventResize={resizeEvent}
            onSelectSlot={handleSelectSlot}
            eventPropGetter={eventPropGetter}
            selected={selected}
            scrollToTime={dayjs().toDate()}
            onView={handleViewChange}
            view={currentView}
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
        {currentView === Views.DAY && (
          <Box
            sx={{
              width: 340,
              borderRadius: 1,
              borderWidth: 1,
              borderColor: "#dddddd",
              borderStyle: "solid",
              p: 2,
            }}
            gap={2}
          >
            <DateCalendar />
            <Divider />
            <Pomodoro />
          </Box>
        )}
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
