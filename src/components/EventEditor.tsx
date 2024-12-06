import { forwardRef, useImperativeHandle } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Box, Button, Typography, Stack } from "@mui/material";
import TextField from "@mui/material/TextField";
import { DateField } from "@mui/x-date-pickers/DateField";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import { useForm, Controller } from "react-hook-form";
import { EventInfo } from "../App";

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
};

const today = dayjs();

const EventEditor = forwardRef(({ setEvent }: EventEditorProps, ref) => {
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

    setEvent({
      id: values.eventId,
      start: values.eventStartTime.toDate(),
      end: values.eventEndTime.toDate(),
      title: values.eventTitle,
      description: values.eventDescription,
    });
  };

  return (
    <form onSubmit={formContext.handleSubmit(submit)}>
      <Box
        sx={{
          width: 300,
          p: 2,
          border: "1px solid #ccc",
          borderRadius: 1,
          backgroundColor: "#fff",
          minHeight: 1064,
        }}
        height={"100vh"}
        gap={2}
      >
        <Stack spacing={2}>
          <Typography variant="h6" gutterBottom>
            Event
          </Typography>
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
                label="Event Title"
              />
            )}
          />
          <Controller
            name="eventDate"
            control={formContext.control}
            render={({ field }) => {
              return <DateField {...field} label="Event Date" />;
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
              render={({ field }) => <TimePicker {...field} label="End Time" />}
            />
          </Stack>
          <Controller
            name="eventDescription"
            control={formContext.control}
            render={({ field }) => (
              <TextareaAutosize {...field} minRows={6} maxRows={8} />
            )}
          />
          <Button variant="contained" color="primary" fullWidth type={"submit"}>
            Save
          </Button>
        </Stack>
      </Box>
    </form>
  );
});

EventEditor.displayName = "EventEditor";

export default EventEditor;
