import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useCallback, useMemo, useState, useRef } from "react";
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
import EventEditor, { EditorHandle } from "./EventEditor";
import Box from "@mui/material/Box";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

dayjs.extend(timezone);

// end optional time zone support

// Note that the dayjsLocalizer extends Day.js with the following plugins:
// - IsBetween
// - IsSameOrAfter
// - IsSameOrBefore
// - LocaleData
// - LocalizedFormat
// - MinMax
// - UTC

type EventInfo = Event & { id?: string };

// const generateId = () => (Math.floor(Math.random() * 10000) + 1).toString();

const DragAndDropCalendar = withDragAndDrop(Calendar);

function App() {
  const childRef = useRef<EditorHandle>(null);

  const [myEvents, setMyEvents] = useState<EventInfo[]>([]);

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
      const { allDay } = event;
      if (!allDay && droppedOnAllDaySlot) {
        event.allDay = true;
      }
      if (allDay && !droppedOnAllDaySlot) {
        event.allDay = false;
      }

      setMyEvents((prev) => {
        const existing = prev.find((ev) => ev.id === event.id) ?? {};
        const filtered = prev.filter((ev) => ev.id !== event.id);
        return [
          ...filtered,
          {
            ...existing,
            start: new Date(start),
            end: new Date(end),
            allDay: event.allDay,
          },
        ];
      });
    },
    [setMyEvents]
  );

  const resizeEvent = useCallback(
    ({ event, start, end }: EventInteractionArgs<EventInfo>) => {
      setMyEvents((prev) => {
        const existing = prev.find((ev) => ev.id === event.id) ?? {};
        const filtered = prev.filter((ev) => ev.id !== event.id);
        return [
          ...filtered,
          { ...existing, start: new Date(start), end: new Date(end) },
        ];
      });
    },
    [setMyEvents]
  );

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      childRef.current?.createEvent({ start, end });
      // childRef.current?.focusField("eventTitle");
      // const title = "New Event";
      // if (title) {
      //   setMyEvents((prev) => [
      //     ...prev,
      //     { id: generateId(), start, end, title },
      //   ]);
      // }
    },
    [setMyEvents]
  );

  const handleSelectEvent = useCallback((event: Event) => {
    console.log("🚀 ~ handleSelectEvent ~ event:", event);
    childRef.current?.focusField("eventTitle");
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" gap={2} p={6}>
        <Box flex={1}>
          <DragAndDropCalendar
            defaultView={Views.WEEK}
            events={myEvents}
            localizer={localizer}
            popup
            resizable={true}
            selectable
            views={views}
            onSelectEvent={handleSelectEvent}
            onEventDrop={moveEvent}
            onEventResize={resizeEvent}
            onSelectSlot={handleSelectSlot}
          />
        </Box>
        <EventEditor ref={childRef} />
      </Box>
    </LocalizationProvider>
  );
}

export default App;
