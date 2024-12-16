import { useColorScheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import timeblock from "../assets/timeblock.png";

const Header = () => {
  const { mode, setMode } = useColorScheme();

  return (
    <AppBar
      position="static"
      color="inherit"
      enableColorOnDark
      sx={{ boxShadow: 0, borderBottom: 1, borderColor: "grey.200" }}
    >
      <Toolbar>
        <Box flexGrow={1}>
          <Box display="flex" gap={1}>
            <img
              src={timeblock}
              width={20}
              height={30}
              style={{ objectFit: "contain" }}
            />
            <Typography variant="h6">My TimeBlock</Typography>
          </Box>
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
