import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import { useColorScheme } from "@mui/material/styles";
import { SnackbarProvider, closeSnackbar } from "notistack";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router";
import { PersistGate } from "redux-persist/integration/react";
import "./App.css";
import Clockwise from "./components/Clockwise";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";
import LandingPage from "./components/LandingPage";
import AuthContext from "./context/AuthContext";
import Login from "./routes/Login";
import Protected from "./routes/Protected";
import Reset from "./routes/Reset";
import SignUp from "./routes/SignUp";
import { persistor, store } from "./store/store";

function App() {
  const { mode } = useColorScheme();

  if (!mode) {
    return <></>;
  }
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthContext>
          <SnackbarProvider
            action={(snackbarId) => (
              <CloseIcon onClick={() => closeSnackbar(snackbarId)} />
            )}
          >
            <BrowserRouter>
              <Box className={mode} sx={{ pb: 7 }}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
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
                  <Route path="/clockwise" element={<Clockwise />} />
                </Routes>
                <Footer />
              </Box>
            </BrowserRouter>
          </SnackbarProvider>
        </AuthContext>
      </PersistGate>
    </Provider>
  );
}

export default App;
