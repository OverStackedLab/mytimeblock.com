import { Box, Button, Typography, Stack } from "@mui/material";
import {
  FormContainer,
  TextFieldElement,
  TextareaAutosizeElement,
} from "react-hook-form-mui";
import { useForm } from "react-hook-form";

const EventEditor = () => {
  const formContext = useForm<{ eventTitle: string; eventDescription: string }>(
    {
      defaultValues: {
        eventTitle: "",
        eventDescription: "",
      },
    }
  );

  type FormValues = {
    eventTitle: string;
    eventDescription: string;
  };

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
};

export default EventEditor;
