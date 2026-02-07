import SettingsIcon from "@mui/icons-material/Settings";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { grey } from "@mui/material/colors";
import { useColorScheme } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import { useLocation, useNavigate } from "react-router";
import timeblock from "../assets/timeblock.png";
import { Context } from "../context/AuthContext";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { logoutUser } from "../services/authSlice";

const Header = () => {
  const { mode, setMode } = useColorScheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(Context);
  const dispatch = useAppDispatch();
  const handleSignOut = async () => {
    try {
      await dispatch(logoutUser());
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isProtectedRoute = () => {
    return ["/dashboard", "/todos", "/settings"].includes(location.pathname);
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
            display="inline-flex"
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
            <Typography variant="h6">MyTimeBlock</Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          {!user && !isProtectedRoute() && (
            <>
              <Button
                color="inherit"
                onClick={() => navigate("/login")}
                size="small"
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/signup")}
                size="small"
                sx={{ ml: 1, color: grey[50] }}
              >
                Sign Up
              </Button>
            </>
          )}
          {user && isProtectedRoute() && (
            <>
              <Button
                color="inherit"
                onClick={() => navigate("/dashboard")}
                size="small"
                sx={{
                  color: location.pathname === "/dashboard" ? "#ff9800" : "inherit",
                  fontWeight: location.pathname === "/dashboard" ? 600 : 400,
                }}
              >
                Calendar
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate("/todos")}
                size="small"
                sx={{
                  color: location.pathname === "/todos" ? "#ff9800" : "inherit",
                  fontWeight: location.pathname === "/todos" ? 600 : 400,
                }}
              >
                Todos
              </Button>
              <Tooltip title="Settings">
                <IconButton
                  onClick={() => navigate("/settings")}
                  size="small"
                  sx={{
                    color: location.pathname === "/settings" ? "#ff9800" : "inherit",
                  }}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Checkbox
            icon={<WbSunnyIcon />}
            checkedIcon={<WbSunnyIcon />}
            checked={mode === "light"}
            onChange={() => setMode(mode === "light" ? "dark" : "light")}
          />
          {user && isProtectedRoute() && (
            <Button
              variant="text"
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
