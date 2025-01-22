import { useState, useRef, useEffect, useContext } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, {
  EventResizeDoneArg,
} from "@fullcalendar/interaction";
import { generateId } from "../utils/createEventId";
import {
  DateSelectArg,
  EventAddArg,
  EventClickArg,
  EventDropArg,
} from "@fullcalendar/core";
import { Alert, IconButton, Box, Collapse } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAppSelector } from "../hooks/useAppSlector";
import {
  addEventToFirebase,
  updateEventInFirebase,
  deleteEventFromFirebase,
  fetchEvents,
  calendar,
} from "../services/calendarSlice";
import { useAppDispatch } from "../hooks/useAppDispatch";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import SideBar from "./SideBar";
import EventEditor, { EditorHandle } from "./EventEditor";
import { CalendarEvent } from "../@types/Events";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Context } from "../context/AuthContext";

type ContextMenuType = {
  mouseX: number;
  mouseY: number;
} | null;

const Calendar = () => {
  const { events } = useAppSelector(calendar);
  const dispatch = useAppDispatch();
  const [contextMenu, setContextMenu] = useState<ContextMenuType>(null);
  const { user } = useContext(Context);
  const [alertOpen, setAlertOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const childRef = useRef<EditorHandle>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchEvents(user?.uid || ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

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

  const handleEventAdd = (arg: EventAddArg) => {
    if (!user) {
      return;
    }
    const newEvent = {
      ...arg.event.toPlainObject(),
      color: "",
      extendedProps: {
        description: "",
      },
    } as CalendarEvent;

    dispatch(addEventToFirebase({ event: newEvent, userId: user.uid }));
  };

  const handleEventDrop = (info: EventDropArg) => {
    if (!user) {
      return;
    }
    const updatedEvent = {
      ...info.event.toPlainObject(),
      extendedProps: {
        description: "",
      },
    } as CalendarEvent;
    dispatch(updateEventInFirebase({ event: updatedEvent, userId: user.uid }));
  };

  const handleEventResize = (info: EventResizeDoneArg) => {
    if (!user) {
      return;
    }
    const updatedEvent = {
      ...info.event.toPlainObject(),
      extendedProps: {
        description: "",
      },
    } as CalendarEvent;
    dispatch(updateEventInFirebase({ event: updatedEvent, userId: user.uid }));
  };

  const toggleSidebar = (open: boolean) => () => {
    setIsSidebarOpen(open);
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
    if (!user) {
      return;
    }
    dispatch(
      deleteEventFromFirebase({
        event: event,
        userId: user.uid,
      })
    );
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event.toPlainObject() as CalendarEvent;
    setSelectedEvent(event);
    childRef.current?.updateEvent(event);
    toggleSidebar(true);
  };

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
      <Box height={1010} marginBottom={30} px={4}>
        <FullCalendar
          headerToolbar={{
            left: "prev,next,today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          nowIndicator={true}
          events={events}
          eventAdd={handleEventAdd}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventDidMount={(info) => {
            info.el.addEventListener(
              "contextmenu",
              (event) => {
                event.preventDefault();
                handleContextMenu({
                  clientX: event.clientX,
                  clientY: event.clientY,
                } as React.MouseEvent);
                setSelectedEvent(info.event.toPlainObject() as CalendarEvent);

                return false;
              },
              false
            );
          }}
          select={handleDateSelect}
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
          <MenuItem onClick={handleClose}>Duplicate</MenuItem>
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
      <SideBar open={isSidebarOpen} onClose={toggleSidebar(false)}>
        <EventEditor
          ref={childRef}
          closeEditor={toggleSidebar(false)}
          setEvent={() => {}}
          deleteEvent={handleDeleteEvent}
        />
      </SideBar>
    </LocalizationProvider>
  );
};

export default Calendar;
