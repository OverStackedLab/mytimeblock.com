import "./App.css";
import Box from "@mui/material/Box";

import { useColorScheme } from "@mui/material/styles";
import Calendar from "./components/Calendar";
import Header from "./components/Header";

function App() {
  const { mode } = useColorScheme();

  if (!mode) {
    return <></>;
  }

  return (
    <Box className={mode}>
      <Header />
      <Calendar />
    </Box>
  );
}

export default App;
