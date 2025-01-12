import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { generateId } from "../utils/createEventId";
import { DateSelectArg } from "@fullcalendar/core/index.js";

const Calendar = () => {
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const title = prompt("Please enter a new title for your event");
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: generateId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });
    }
  };
  return (
    <>
      <FullCalendar
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        events={[
          {
            title: "event 1",
            date: "2025-01-12",
            isAllDay: true,
            color: "red",
          },
          {
            title: "event 2",
            date: "2025-01-12",
            isAllDay: true,
            color: "blue",
          },
        ]}
        eventDidMount={(info) => {
          info.el.addEventListener(
            "contextmenu",
            (ev) => {
              ev.preventDefault();
              console.log("left click");
              return false;
            },
            false
          );
        }}
        select={handleDateSelect}
      />
    </>
  );
};

export default Calendar;
