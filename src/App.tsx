import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router";
import Box from "@mui/material/Box";
import { useColorScheme } from "@mui/material/styles";
import SignUp from "./routes/SignUp";
import Login from "./routes/Login";
import Dashboard from "./components/Dashboard";
import Protected from "./routes/Protected";
import AuthContext from "./context/AuthContext";
import Reset from "./routes/Reset";

function App() {
  const { mode } = useColorScheme();

  if (!mode) {
    return <></>;
  }

  return (
    <AuthContext>
      <BrowserRouter>
        <Box className={mode}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset" element={<Reset />} />
            <Route
              path="/dashboard"
              element={
                <Protected>
                  <Dashboard />
                </Protected>
              }
            />
          </Routes>
        </Box>
      </BrowserRouter>
    </AuthContext>
  );
}

export default App;
