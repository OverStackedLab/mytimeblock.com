import { forwardRef, useImperativeHandle } from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import {
  FormContainer,
  TextFieldElement,
  TextareaAutosizeElement,
} from "react-hook-form-mui";
import {
  DatePickerElement,
  TimePickerElement,
} from "react-hook-form-mui/date-pickers";
import { useForm } from "react-hook-form";

type TimeSlot = {
  start: Date;
  end: Date;
};

export type EditorHandle = {
  focusField: (field: string) => void;
  createEvent: ({ start, end }: TimeSlot) => void;
};

type FormValues = {
  eventTitle: string;
  eventDescription: string;
};

// const generateId = () => (Math.floor(Math.random() * 10000) + 1).toString();

const EventEditor = forwardRef((_, ref) => {
  const formContext = useForm<{ eventTitle: string; eventDescription: string }>(
    {
      defaultValues: {
        eventTitle: "",
        eventDescription: "",
      },
    }
  );

  useImperativeHandle(ref, () => ({
    focusField: (field: "eventTitle" | "eventDescription") => {
      formContext.setFocus(field);
    },
    createEvent: ({ start, end }: TimeSlot) => {
      console.log("🚀 ~ useImperativeHandle ~ end:", end);
      console.log("🚀 ~ useImperativeHandle ~ start:", start);
      formContext.setFocus("eventTitle");
    },
  }));

  const submit = (values: FormValues) => {
    console.log(values);
  };

  return (
    <FormContainer
      formContext={formContext}
      defaultValues={{}}
      onSuccess={submit}
    >
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
          <TextFieldElement label="Event Title" name="eventTitle" required />
          <DatePickerElement label="Event Date" name="eventDate" />
          <Stack direction="row" spacing={2}>
            <TimePickerElement
              label="Start Time"
              name="eventStartTime"
              required
            />
            <TimePickerElement label="End Time" name="eventEndTime" required />
          </Stack>
          <TextareaAutosizeElement
            label="Description"
            name="eventDescription"
            resizeStyle="vertical"
            rows={3}
          />
          <Button variant="contained" color="primary" fullWidth type={"submit"}>
            Save
          </Button>
        </Stack>
      </Box>
    </FormContainer>
  );
});

EventEditor.displayName = "EventEditor";

export default EventEditor;
