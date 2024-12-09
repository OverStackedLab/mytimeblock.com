import { createTheme } from "@mui/material/styles";
import { red, grey } from "@mui/material/colors";

// Custom theme
const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#ff8900",
          light: "#E9DB5D",
          dark: "#A29415",
          contrastText: "#fff",
        },
        secondary: {
          main: "#f8eb00",
          light: "#E9DB5D",
          dark: "#A29415",
          contrastText: "#242105",
        },
        error: {
          main: red.A400,
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: grey[600],
          light: "#E9DB5D",
          dark: "#A29415",
          contrastText: "#fff",
        },
        secondary: {
          main: "#f8eb00",
          light: "#E9DB5D",
          dark: "#A29415",
          contrastText: "#242105",
        },
        error: {
          main: red.A400,
        },
      },
    },
  },
});

export default theme;
