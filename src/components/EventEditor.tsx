import { forwardRef, useImperativeHandle, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useForm, Controller } from "react-hook-form";
import { useTheme } from "@mui/system";
import { Box, Button, Typography, Stack, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import { orange } from "@mui/material/colors";
import ColorPicker from "./ColorPicker";
import type { EventInfo } from "./Calendar";

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
  eventColor: string;
  eventStartDate?: Dayjs;
  eventEndDate?: Dayjs;
};

type EventEditorProps = {
  setEvent: (event: EventInfo) => void;
  deleteEvent: (eventId: string) => void;
  closeEditor: () => void;
};

const today = dayjs();

const EventEditor = forwardRef<EditorHandle, EventEditorProps>(
  ({ setEvent, deleteEvent, closeEditor }, ref) => {
    const theme = useTheme();
    const [color, setColor] = useState<string>(orange[700]);

    const formContext = useForm<FormValues>({
      defaultValues: {
        eventId: "",
        eventTitle: "",
        eventDate: today,
        eventStartTime: today.startOf("hour"),
        eventEndTime: today.endOf("hour").add(30, "minute"),
        eventDescription: "",
        eventColor: orange[700],
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
        formContext.setValue("eventColor", event?.color || orange[700]);
        setColor(event?.color || orange[700]);
      },
    }));

    const submit = (values: FormValues) => {
      formContext.setValue("eventTitle", "");
      setColor(orange[700]);

      const eventDate = dayjs(values.eventDate);
      let eventStartTime = dayjs(values.eventStartTime);
      let eventEndTime = dayjs(values.eventEndTime);

      if (!dayjs(values.eventStartTime).isSame(values.eventDate, "day")) {
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
        color: color,
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
                  {...field}
                  required
                  autoComplete="off"
                  label="Block Title"
                />
              )}
            />
            <Controller
              name="eventDate"
              control={formContext.control}
              render={({ field }) => (
                <DatePicker {...field} label="Block Date" />
              )}
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
            <Box py={2}>
              <Controller
                name="eventColor"
                control={formContext.control}
                render={({ field }) => (
                  <ColorPicker
                    value={field.value}
                    onChange={(color) => {
                      field.onChange(color);
                      setColor(color);
                    }}
                  />
                )}
              />
            </Box>
            <Stack direction="row" gap={2} pb={2}>
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
            <Box>
              <Typography
                display="inline"
                variant="subtitle1"
                fontWeight={500}
                pr={0.5}
              >
                Duration:
              </Typography>
              <Typography display="inline" variant="body2">
                {(() => {
                  const diffMinutes = dayjs(
                    formContext.watch("eventEndTime")
                  ).diff(formContext.watch("eventStartTime"), "minutes");
                  const diffHours = Math.floor(diffMinutes / 60);
                  const remainingMinutes = diffMinutes % 60;

                  if (diffMinutes < 60) {
                    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"}`;
                  }

                  return `${diffHours} hour${diffHours === 1 ? "" : "s"}${
                    remainingMinutes
                      ? ` ${remainingMinutes} minute${
                          remainingMinutes === 1 ? "" : "s"
                        }`
                      : ""
                  }`;
                })()}
              </Typography>
            </Box>
          </Stack>
        </form>
      </Box>
    );
  }
);

EventEditor.displayName = "EventEditor";

export default EventEditor;
