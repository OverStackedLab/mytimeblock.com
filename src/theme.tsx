import { grey, orange, red } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

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
        background: {
          default: "#fafafa",
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
        background: {
          default: "#212121",
        },
      },
    },
  },
});

export default theme;
