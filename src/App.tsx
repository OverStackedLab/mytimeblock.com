import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useMemo } from "react";
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
  const localizer = useMemo(() => dayjsLocalizer(dayjs), []);

  const { views } = useMemo(
    () => ({
      views: [Views.MONTH, Views.WEEK, Views.DAY],
    }),
    []
  );

  return (
    <DragAndDropCalendar
      // defaultDate={defaultDate}
      defaultView={Views.WEEK}
      events={events}
      localizer={localizer}
      // onEventDrop={moveEvent}
      // onEventResize={resizeEvent}
      popup
      resizable
      views={views}
    />
  );
}

export default App;
