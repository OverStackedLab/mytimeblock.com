import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

// Custom theme
const theme = createTheme({
  colorSchemes: {
    light: true,
    dark: true,
  },
  palette: {
    primary: {
      main: "#ff8900",
    },
    secondary: {
      main: "#f8eb00",
    },
    error: {
      main: red.A400,
    },
  },
});

export default theme;
