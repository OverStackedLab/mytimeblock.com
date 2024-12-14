import { forwardRef, useImperativeHandle } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Box, Button, Typography, Stack } from "@mui/material";
import TextField from "@mui/material/TextField";
import { DateField } from "@mui/x-date-pickers/DateField";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import { useForm, Controller } from "react-hook-form";
import { EventInfo } from "../App";
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
};

const today = dayjs();

const EventEditor = forwardRef(
  ({ setEvent, deleteEvent }: EventEditorProps, ref) => {
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

      setEvent({
        id: values.eventId,
        start: values.eventStartTime.toDate(),
        end: values.eventEndTime.toDate(),
        title: values.eventTitle,
        description: values.eventDescription,
      });
    };

    return (
      <form
        onSubmit={formContext.handleSubmit(submit)}
        className={theme.palette.mode}
      >
        <Box
          className={"block-editor"}
          sx={{
            width: 300,
            pt: 4,
            px: 3,
            border: "gray.200",
            borderRadius: 1,
            minHeight: 1064,
          }}
          height={"100vh"}
          gap={2}
        >
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom>
              Block
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
                  label="Block Title"
                />
              )}
            />
            <Controller
              name="eventDate"
              control={formContext.control}
              render={({ field }) => {
                return <DateField {...field} label="Block Date" />;
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
                  minRows={6}
                  maxRows={8}
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
    );
  }
);

EventEditor.displayName = "EventEditor";

export default EventEditor;
