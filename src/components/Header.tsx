import { useColorScheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import WbSunnyIcon from "@mui/icons-material/WbSunny";

const Header = () => {
  const { mode, setMode } = useColorScheme();

  return (
    <AppBar position="static" color="inherit">
      <Toolbar>
        <Box flexGrow={1}>
          <Typography variant="h6">My TimeBlock</Typography>
        </Box>
        <Checkbox
          icon={<WbSunnyIcon />}
          checkedIcon={<WbSunnyIcon />}
          checked={mode === "light" ? true : false}
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
        />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
