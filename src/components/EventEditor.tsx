import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useForm, Controller } from "react-hook-form";
import { useTheme } from "@mui/system";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import { orange } from "@mui/material/colors";
import ColorPicker from "./ColorPicker";
import { CalendarEvent } from "@/@types/Events";
import { v4 as uuidv4 } from "uuid";
import { useAppSelector } from "../hooks/useAppSlector";
import { selectCategories } from "../services/categoriesSlice";

export type EditorHandle = {
  focusField: (field: string) => void;
  setEventFormValues: (event: CalendarEvent) => void;
  requestClose: () => void;
};

export type FormValues = {
  eventId: string;
  eventTitle: string;
  eventDescription: string;
  eventDate: Dayjs;
  eventStartTime: Dayjs;
  eventEndTime: Dayjs;
  eventSwatch: string;
  eventCategoryId: string;
  eventStartDate?: Dayjs;
  eventEndDate?: Dayjs;
};

type EventEditorProps = {
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (event: CalendarEvent) => void;
  closeEditor: () => void;
};

const today = dayjs();

const EventEditor = forwardRef(
  ({ updateEvent, deleteEvent, closeEditor }: EventEditorProps, ref) => {
    const theme = useTheme();
    const [allDay, setAllDay] = useState(false);
    const [event, setEvent] = useState<CalendarEvent | null>(null);
    const { categories } = useAppSelector(selectCategories);

    const formContext = useForm<FormValues>({
      defaultValues: {
        eventId: "",
        eventTitle: "",
        eventDate: today,
        eventStartTime: today.startOf("hour"),
        eventEndTime: today.endOf("hour").add(30, "minute"),
        eventDescription: "",
        eventSwatch: orange[700],
        eventCategoryId: "",
      },
    });

    const [color, setColor] = useState<string>(orange[700]);
    const [initialColor, setInitialColor] = useState<string>(orange[700]);
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);

    useEffect(() => {
      const matchingCategory = categories.find((c) => c.color === color);
      formContext.setValue("eventCategoryId", matchingCategory?.id || "", {
        shouldDirty: false,
      });
    }, [color, categories, formContext]);

    const handleCloseRequest = () => {
      const isDirty =
        formContext.formState.isDirty || color !== initialColor;
      if (isDirty) {
        setShowDiscardDialog(true);
      } else {
        closeEditor();
      }
    };

    const handleDiscard = () => {
      setShowDiscardDialog(false);
      closeEditor();
    };

    useImperativeHandle(ref, () => ({
      focusField: (field: "eventTitle" | "eventDescription") => {
        formContext.setFocus(field, { shouldSelect: true });
      },
      setEventFormValues: (event: CalendarEvent) => {
        setEvent(event);
        const eventColor = event?.backgroundColor || orange[700];
        formContext.reset({
          eventId: event?.id || uuidv4(),
          eventTitle: (event?.title as string) || "",
          eventDate: dayjs(event.start),
          eventStartTime: dayjs(event.start),
          eventEndTime: dayjs(event.end),
          eventDescription: event?.extendedProps?.description || "",
          eventSwatch: eventColor,
          eventCategoryId: event?.categoryId || "",
          ...(event?.allDay
            ? {
                eventStartDate: dayjs(event.start),
                eventEndDate: dayjs(event.end),
              }
            : {}),
        });
        setColor(eventColor);
        setInitialColor(eventColor);
        setAllDay(event?.allDay || false);
      },
      requestClose: () => {
        handleCloseRequest();
      },
    }));

    const submit = (values: FormValues) => {
      formContext.setValue("eventTitle", "");
      setColor(orange[700]);

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

      updateEvent({
        id: values.eventId,
        start: eventStartTime.toDate(),
        end: eventEndTime.toDate(),
        title: values.eventTitle,
        extendedProps: {
          description: values.eventDescription,
        },
        backgroundColor: color,
        ...(values.eventCategoryId ? { categoryId: values.eventCategoryId } : {}),
      });
      closeEditor();
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
          <Button variant="text" onClick={handleCloseRequest}>
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
              {allDay ? (
                <Stack direction="row" spacing={2}>
                  <Controller
                    name="eventStartDate"
                    control={formContext.control}
                    render={({ field }) => {
                      return (
                        <DatePicker
                          {...field}
                          label="Start Date"
                          onChange={field.onChange}
                        />
                      );
                    }}
                  />
                  <Controller
                    name="eventEndDate"
                    control={formContext.control}
                    render={({ field }) => {
                      return (
                        <DatePicker
                          {...field}
                          label="End Date"
                          onChange={field.onChange}
                        />
                      );
                    }}
                  />
                </Stack>
              ) : (
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
              )}
              <Stack direction="row" spacing={2}>
                <Controller
                  name="eventStartTime"
                  control={formContext.control}
                  render={({ field }) => (
                    <TimePicker {...field} label="Start Time" minutesStep={5} />
                  )}
                />
                <Controller
                  name="eventEndTime"
                  control={formContext.control}
                  render={({ field }) => (
                    <TimePicker {...field} label="End Time" minutesStep={5} />
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
                <ColorPicker
                  value={color}
                  onChange={setColor}
                  control={formContext.control}
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
                  onClick={() => {
                    if (event) {
                      deleteEvent(event);
                      closeEditor();
                    }
                  }}
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
                      return `${diffMinutes} minute${
                        diffMinutes === 1 ? "" : "s"
                      }`;
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
          </Box>
        </form>
        <Dialog open={showDiscardDialog} onClose={() => setShowDiscardDialog(false)}>
          <DialogTitle>Unsaved changes</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You have unsaved changes that will be lost. Do you want to discard
              them?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDiscardDialog(false)}>
              Keep Editing
            </Button>
            <Button onClick={handleDiscard} color="error">
              Discard
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
);

EventEditor.displayName = "EventEditor";

export default EventEditor;
