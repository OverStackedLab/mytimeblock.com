import { Box, TextField, Button, Typography } from "@mui/material";

const EventEditor = () => {
  return (
    <Box
      sx={{
        width: 300,
        padding: 2,
        border: "1px solid #ccc",
        borderRadius: 1,
        backgroundColor: "#fff",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Event
      </Typography>
      <TextField
        label="Event Title"
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <TextField
        label="Date"
        type="date"
        variant="outlined"
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        label="Time"
        type="time"
        variant="outlined"
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        label="Description"
        variant="outlined"
        fullWidth
        margin="normal"
        multiline
        rows={4}
      />
      <Button variant="contained" color="primary" fullWidth>
        Save
      </Button>
    </Box>
  );
};

export default EventEditor;
