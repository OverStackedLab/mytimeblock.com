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
import Footer from "./components/Footer";
import CloseIcon from "@mui/icons-material/Close";
import { SnackbarProvider, closeSnackbar } from "notistack";
import { Provider } from "react-redux";
import { persistor, store } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";

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
