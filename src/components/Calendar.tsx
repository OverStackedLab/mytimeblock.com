import { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, {
  EventResizeDoneArg,
} from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import CloseIcon from "@mui/icons-material/Close";
import { Alert, Box, Collapse, Divider, IconButton } from "@mui/material";
import { orange } from "@mui/material/colors";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { useContext, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { CalendarEvent } from "../@types/Events";
import { Context } from "../context/AuthContext";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSlector";
import useIsTouchDevice from "../hooks/useIsTouchDevice";
import {
  addEventToFirebase,
  calendar,
  deleteEventFromFirebase,
  fetchEvents,
  updateEventInFirebase,
} from "../services/calendarSlice";
import EventEditor, { EditorHandle } from "./EventEditor";
import Pomodoro from "./Pomodoro";
import SideBar from "./SideBar";
import UserInfo from "./UserInfo";

const adminEmails = import.meta.env.VITE_FIREBASE_ADMIN_EMAIL.split(",");

type ContextMenuType = {
  mouseX: number;
  mouseY: number;
} | null;

const Calendar = () => {
  const isTouchDevice = useIsTouchDevice();
  const { events } = useAppSelector(calendar);
  const dispatch = useAppDispatch();
  const [contextMenu, setContextMenu] = useState<ContextMenuType>(null);
  const { user } = useContext(Context);
  const [alertOpen, setAlertOpen] = useState(() => {
    const stored = localStorage.getItem("calendarAlertClosed");
    return stored !== "true";
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [calendarDate, setCalendarDate] = useState<Dayjs | null>(dayjs());
  const childRef = useRef<EditorHandle>(null);
  const calendarRef = useRef<FullCalendar>(null);

  const isAdmin = adminEmails.includes(user?.email || "");

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchEvents(user?.uid || ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.getApi().getDate();
    }
  }, []);

  const handleContextMenu = (event: React.MouseEvent) => {
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const startTime = dayjs(selectInfo.startStr);
    const endTime = dayjs(selectInfo.endStr);
    const diffInMinutes = endTime.diff(startTime, "minute");

    if (selectInfo.jsEvent?.detail === 2 || diffInMinutes > 30) {
      const title = "New block";
      const newEvent = {
        id: uuidv4(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
        backgroundColor: orange[700],
        extendedProps: {
          description: "",
        },
      } as CalendarEvent;

      if (title) {
        dispatch(
          addEventToFirebase({ event: newEvent, userId: user?.uid || "" })
        );
      }
    }
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
    if (!user) {
      return;
    }
    dispatch(
      deleteEventFromFirebase({
        event: event,
        userId: user?.uid || "",
      })
    );
  };

  const handleDuplicateEvent = (event: CalendarEvent) => {
    if (!user) {
      return;
    }

    const duplicatedEvent = {
      ...event,
      id: uuidv4(),
      start: dayjs(event.end).format("YYYY-MM-DDTHH:mm:ssZ"),
      end: dayjs(event.end).add(30, "minute").format("YYYY-MM-DDTHH:mm:ssZ"),
    };
    setSelectedEvent(null);
    dispatch(
      addEventToFirebase({
        event: duplicatedEvent,
        userId: user.uid || "",
      })
    );
  };

  const handleEventUpdate = (event: CalendarEvent) => {
    if (!user) {
      return;
    }

    dispatch(
      updateEventInFirebase({
        event: {
          ...event,
          start: dayjs(event.start).format("YYYY-MM-DDTHH:mm:ssZ"),
          end: dayjs(event.end).format("YYYY-MM-DDTHH:mm:ssZ"),
        },
        userId: user?.uid || "",
      })
    );
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event.toPlainObject() as CalendarEvent;
    childRef.current?.setEventFormValues(event);
    setIsSidebarOpen(true);
  };

  const handleEventResize = (info: EventResizeDoneArg) => {
    if (!user) {
      return;
    }
    const updatedEvent = {
      ...info.event.toPlainObject(),
      extendedProps: {
        description: info.event.extendedProps.description || "",
      },
    } as CalendarEvent;
    dispatch(
      updateEventInFirebase({
        event: updatedEvent,
        userId: user?.uid || "",
      })
    );
  };

  const handleEventDrop = (info: EventDropArg) => {
    if (!user) {
      return;
    }
    const updatedEvent = {
      ...info.event.toPlainObject(),
      extendedProps: {
        description: info.event.extendedProps.description || "",
      },
    } as CalendarEvent;
    dispatch(
      updateEventInFirebase({
        event: updatedEvent,
        userId: user?.uid || "",
      })
    );
  };

  const handleDateChange = (date: Date) => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(dayjs(date).format("YYYY-MM-DD"));
      setCalendarDate(dayjs(date));
    }
  };

  const alertMessage = isTouchDevice
    ? "Touch and hold a time slot to start creating blocks!"
    : "Double click or drag on a time slot to start creating blocks!";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box px={4} py={1}>
        <Collapse in={alertOpen}>
          <Alert
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setAlertOpen(false);
                  localStorage.setItem("calendarAlertClosed", "true");
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {alertMessage}
          </Alert>
        </Collapse>
      </Box>
      <Box display="flex">
        <Box mb={4} px={4} width="100%">
          <FullCalendar
            ref={calendarRef}
            customButtons={{
              todayBtn: {
                text: "Today",
                click: () => {
                  calendarRef.current?.getApi().today();
                  setCalendarDate(dayjs());
                },
              },
            }}
            headerToolbar={{
              left: "todayBtn,prev,next",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            height="calc(100vh - 150px)"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            editable={true}
            selectable={true}
            nowIndicator={true}
            unselectAuto={true}
            events={events}
            eventClick={handleEventClick}
            eventDidMount={(info) => {
              info.el.addEventListener(
                "contextmenu",
                (event) => {
                  event.preventDefault();
                  if (isTouchDevice) {
                    return;
                  }
                  handleContextMenu({
                    clientX: event.clientX,
                    clientY: event.clientY,
                  } as React.MouseEvent);

                  const calendarApi = calendarRef.current?.getApi();
                  const eventById = calendarApi?.getEventById(info.event.id);

                  setSelectedEvent(eventById?.toPlainObject() as CalendarEvent);

                  return false;
                },
                false
              );
            }}
            select={handleDateSelect}
            eventResize={handleEventResize}
            eventDrop={handleEventDrop}
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
            <MenuItem
              onClick={() => {
                if (selectedEvent) {
                  handleDuplicateEvent(selectedEvent);
                  handleClose();
                }
              }}
            >
              Duplicate
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (selectedEvent) {
                  handleDeleteEvent(selectedEvent);
                  handleClose();
                }
              }}
            >
              Delete
            </MenuItem>
          </Menu>
        </Box>
        <Box pr={4} height="calc(100vh - 150px)" sx={{ overflowY: 'auto' }}>
          <UserInfo />
          <DateCalendar value={calendarDate} onChange={handleDateChange} />
          <Divider />
          <Pomodoro />
        </Box>
      </Box>
      <SideBar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <EventEditor
          ref={childRef}
          closeEditor={() => setIsSidebarOpen(false)}
          updateEvent={handleEventUpdate}
          deleteEvent={handleDeleteEvent}
        />
      </SideBar>
    </LocalizationProvider>
  );
};

export default Calendar;
