import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  Paper,
  Link,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import Header from "../components/Header";
import { useColorScheme } from "@mui/material/styles";

type LoginFormData = {
  email: string;
  password: string;
};

const Login = () => {
  const { mode } = useColorScheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Email and password are required");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      setSuccess("Logged in successfully!");
      setFormData({ email: "", password: "" });
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred during login");
      }
    }
  };

  return (
    <Box className={mode}>
      <Header />
      <Container maxWidth="sm">
        <Box
          sx={{
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              Login
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              <Box
                sx={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Link component={RouterLink} to="/signup" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
                <Link component={RouterLink} to="/reset" variant="body2">
                  Forgot Password?
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
