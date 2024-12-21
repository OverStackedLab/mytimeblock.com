import { useColorScheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import timeblock from "../assets/timeblock.png";
import { useNavigate } from "react-router";
import { Context } from "../context/AuthContext";
import { useContext } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

const Header = () => {
  const { mode, setMode } = useColorScheme();
  const navigate = useNavigate();
  const { user } = useContext(Context);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/signup");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!mode) {
    return <></>;
  }

  return (
    <AppBar
      position="static"
      color="inherit"
      enableColorOnDark
      sx={{ boxShadow: 0, borderBottom: 1, borderColor: "grey.200" }}
    >
      <Toolbar>
        <Box flexGrow={1}>
          <Box
            display="flex"
            gap={1}
            onClick={() => navigate(user ? "/dashboard" : "/")}
            sx={{ cursor: "pointer" }}
          >
            <img
              src={timeblock}
              width={20}
              height={30}
              style={{ objectFit: "contain" }}
              alt="TimeBlock Logo"
            />
            <Typography variant="h6">My TimeBlock</Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Checkbox
            icon={<WbSunnyIcon />}
            checkedIcon={<WbSunnyIcon />}
            checked={mode === "light"}
            onChange={() => setMode(mode === "light" ? "dark" : "light")}
          />
          {user && (
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleSignOut}
              size="small"
            >
              Sign Out
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
