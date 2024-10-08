import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useCallback, useMemo, useState } from "react";
import { dayjsLocalizer, Calendar, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
// When using `Day.js`
import dayjs from "dayjs";
// and, for optional time zone support
import timezone from "dayjs/plugin/timezone";

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

const DragAndDropCalendar = withDragAndDrop(Calendar);

const events = [
  {
    id: 1,
    title: "Long Event",
    start: new Date(new Date().setHours(new Date().getHours() - 3)),
    end: new Date(new Date().setHours(new Date().getHours() + 3)),
  },
];

function App() {
  const [myEvents, setMyEvents] = useState(events);

  const localizer = useMemo(() => dayjsLocalizer(dayjs), []);
  const { views } = useMemo(
    () => ({
      views: [Views.MONTH, Views.WEEK, Views.DAY],
    }),
    []
  );

  const moveEvent = useCallback(
    ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
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
        return [...filtered, { ...existing, start, end, allDay: event.allDay }];
      });
    },
    [setMyEvents]
  );

  const resizeEvent = useCallback(
    ({ event, start, end }) => {
      setMyEvents((prev) => {
        const existing = prev.find((ev) => ev.id === event.id) ?? {};
        const filtered = prev.filter((ev) => ev.id !== event.id);
        return [...filtered, { ...existing, start, end }];
      });
    },
    [setMyEvents]
  );

  const handleSelectSlot = useCallback(
    ({ start, end }) => {
      const title = window.prompt("New Event name");
      if (title) {
        setMyEvents((prev) => [...prev, { start, end, title }]);
      }
    },
    [setMyEvents]
  );

  const handleSelectEvent = useCallback(
    (event) => window.alert(event.title),
    []
  );

  return (
    <DragAndDropCalendar
      defaultView={Views.WEEK}
      events={myEvents}
      localizer={localizer}
      popup
      resizable
      selectable
      views={views}
      onEventDrop={moveEvent}
      onEventResize={resizeEvent}
      onSelectEvent={handleSelectEvent}
      onSelectSlot={handleSelectSlot}
    />
  );
}

export default App;
