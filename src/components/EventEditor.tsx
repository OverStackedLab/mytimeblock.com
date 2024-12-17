import { forwardRef, useImperativeHandle } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Box, Button, Typography, Stack } from "@mui/material";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import { useForm, Controller } from "react-hook-form";
import { EventInfo } from "./Calendar";
import { useTheme } from "@mui/system";

const generateId = () => (Math.floor(Math.random() * 10000) + 1).toString();

export type EditorHandle = {
  focusField: (field: string) => void;
  updateEvent: (event: EventInfo) => void;
};

type FormValues = {
  eventId: string;
  eventTitle: string;
  eventDescription: string;
  eventDate: Dayjs;
  eventStartTime: Dayjs;
  eventEndTime: Dayjs;
};

type EventEditorProps = {
  setEvent: (event: EventInfo) => void;
  deleteEvent: (eventId: string) => void;
  closeEditor: () => void;
};

const today = dayjs();

const EventEditor = forwardRef(
  ({ setEvent, deleteEvent, closeEditor }: EventEditorProps, ref) => {
    const theme = useTheme();

    const formContext = useForm<FormValues>({
      defaultValues: {
        eventId: "",
        eventTitle: "",
        eventDate: today,
        eventStartTime: today.startOf("hour"),
        eventEndTime: today.endOf("hour").add(1, "minute"),
        eventDescription: "",
      },
    });

    useImperativeHandle(ref, () => ({
      focusField: (field: "eventTitle" | "eventDescription") => {
        formContext.setFocus(field, { shouldSelect: true });
      },
      updateEvent: (event: EventInfo) => {
        formContext.setValue("eventTitle", (event?.title as string) || "");
        formContext.setValue("eventDate", dayjs(event.start));
        formContext.setValue("eventStartTime", dayjs(event.start));
        formContext.setValue("eventEndTime", dayjs(event.end));
        formContext.setValue("eventId", event?.id || generateId());
        formContext.setValue("eventDescription", event?.description || "");
      },
    }));

    const submit = (values: FormValues) => {
      formContext.setValue("eventTitle", "");

      const eventDate = dayjs(values.eventDate);
      let eventStartTime = dayjs(values.eventStartTime);
      let eventEndTime = dayjs(values.eventEndTime);

      const isSameDate = dayjs(values.eventStartTime).isSame(
        values.eventDate,
        "day"
      );
      if (!isSameDate) {
        // Ensure eventEndTime matches the same date as eventDate
        eventStartTime = eventStartTime
          .set("year", eventDate.year())
          .set("month", eventDate.month())
          .set("date", eventDate.date());
        eventEndTime = eventEndTime
          .set("year", eventDate.year())
          .set("month", eventDate.month())
          .set("date", eventDate.date());
      }

      setEvent({
        id: values.eventId,
        start: eventStartTime.toDate(),
        end: eventEndTime.toDate(),
        title: values.eventTitle,
        description: values.eventDescription,
      });
    };

    return (
      <Box
        className={theme.palette.mode}
        sx={{
          width: 360,
          px: 3,
          borderRadius: 1,
          minHeight: 1064,
          height: "100vh",
          backgroundColor: theme.palette.primary,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          py={2}
        >
          <Typography variant="h6">Edit Block</Typography>
          <Button variant="text" onClick={closeEditor}>
            Close
          </Button>
        </Stack>
        <form onSubmit={formContext.handleSubmit(submit)}>
          <Box gap={2}>
            <Stack spacing={2}>
              <Controller
                name="eventId"
                control={formContext.control}
                render={({ field }) => (
                  <TextField {...field} sx={{ display: "none" }} />
                )}
              />
              <Controller
                name="eventTitle"
                control={formContext.control}
                render={({ field }) => (
                  <TextField
                    inputRef={field.ref}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    required
                    autoComplete="off"
                    label="Block Title"
                  />
                )}
              />
              <Controller
                name="eventDate"
                control={formContext.control}
                render={({ field }) => {
                  return (
                    <DatePicker
                      {...field}
                      label="Block Date"
                      onChange={field.onChange}
                    />
                  );
                }}
              />
              <Stack direction="row" spacing={2}>
                <Controller
                  name="eventStartTime"
                  control={formContext.control}
                  render={({ field }) => (
                    <TimePicker {...field} label="Start Time" />
                  )}
                />
                <Controller
                  name="eventEndTime"
                  control={formContext.control}
                  render={({ field }) => (
                    <TimePicker {...field} label="End Time" />
                  )}
                />
              </Stack>
              <Controller
                name="eventDescription"
                control={formContext.control}
                render={({ field }) => (
                  <TextareaAutosize
                    className="text-area"
                    {...field}
                    minRows={4}
                    maxRows={6}
                  />
                )}
              />
              <Stack direction="row" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  type="submit"
                  disableElevation
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  disableElevation
                  onClick={() => deleteEvent(formContext.getValues("eventId"))}
                >
                  Delete
                </Button>
              </Stack>
            </Stack>
          </Box>
        </form>
      </Box>
    );
  }
);

EventEditor.displayName = "EventEditor";

export default EventEditor;
