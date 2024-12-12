import { createTheme } from "@mui/material/styles";
import { red, grey, orange } from "@mui/material/colors";

// Custom theme
const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: orange,
        secondary: grey,
        error: {
          main: red.A400,
        },
      },
    },
    dark: {
      palette: {
        primary: grey,
        secondary: orange,
        error: {
          main: red.A400,
        },
      },
    },
  },
});

export default theme;
