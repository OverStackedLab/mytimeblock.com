import {
  CalendarMonth,
  Cloud,
  Devices,
  DragIndicator,
  Notifications,
  Palette,
  Security,
  Timer,
} from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { grey } from "@mui/material/colors";
import { useContext } from "react";
import { useNavigate } from "react-router";
import timeblock from "../assets/timeblock-light.png";
import { Context } from "../context/AuthContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useContext(Context);

  const features = [
    {
      icon: <CalendarMonth fontSize="large" />,
      title: "Smart Calendar Views",
      description:
        "Switch between month, week, and day views to manage your schedule exactly how you prefer.",
    },
    {
      icon: <Timer fontSize="large" />,
      title: "Pomodoro Timer",
      description:
        "Built-in focus timer with customizable intervals to boost your productivity and maintain concentration.",
    },
    {
      icon: <DragIndicator fontSize="large" />,
      title: "Drag & Drop",
      description:
        "Effortlessly reschedule events by dragging and dropping them to new time slots.",
    },
    {
      icon: <Palette fontSize="large" />,
      title: "Color Coding",
      description:
        "Organize your events with custom colors to instantly categorize and identify different types of activities.",
    },
    {
      icon: <Cloud fontSize="large" />,
      title: "Cloud Sync",
      description:
        "Your schedule is automatically saved and synced across all your devices with Firebase integration.",
    },
    {
      icon: <Devices fontSize="large" />,
      title: "Responsive Design",
      description:
        "Access your calendar seamlessly on desktop, tablet, or mobile with our responsive interface.",
    },
    {
      icon: <Security fontSize="large" />,
      title: "Secure Authentication",
      description:
        "Your data is protected with Firebase authentication and enterprise-grade security.",
    },
    {
      icon: <Notifications fontSize="large" />,
      title: "Smart Notifications",
      description:
        "Never miss important events with intelligent notifications and reminders.",
    },
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: theme.palette.primary.main,
          color: "white",
          py: { xs: 8, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  mb: 3,
                }}
              >
                Master Your Day With{" "}
                <Box component="span" sx={{ color: grey[50] }}>
                  MyTimeBlock
                </Box>
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontWeight: 300,
                  lineHeight: 1.4,
                }}
              >
                The all-in-one productivity platform that combines intelligent
                calendar management with built-in focus tools to help you
                achieve more.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                <Chip
                  label="Free to Use"
                  variant="outlined"
                  sx={{ color: grey[50], borderColor: grey[50] }}
                />
                <Chip
                  label="Cloud Sync"
                  variant="outlined"
                  sx={{ color: grey[50], borderColor: grey[50] }}
                />
                <Chip
                  label="Mobile Ready"
                  variant="outlined"
                  sx={{ color: grey[50], borderColor: grey[50] }}
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    bgcolor: grey[50],
                    color: theme.palette.primary.main,
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    "&:hover": {
                      bgcolor: grey[100],
                    },
                  }}
                >
                  {user ? "Go to Dashboard" : "Get Started Free"}
                </Button>
                {/* <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/clockwise")}
                  sx={{
                    color: grey[50],
                    borderColor: grey[50],
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    "&:hover": {
                      borderColor: grey[100],
                      bgcolor: alpha(grey[100], 0.1),
                    },
                  }}
                >
                  Explore Clockwise
                </Button> */}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <Box
                  component="img"
                  src={timeblock}
                  alt="TimeBlock Logo"
                  sx={{
                    width: { xs: 200, md: 300 },
                    height: { xs: 300, md: 450 },
                    objectFit: "contain",
                    color: "red",
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box textAlign="center" mb={8}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Everything You Need to Stay Productive
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            TimeBlock combines powerful calendar features with productivity
            tools to help you manage time like never before.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                sx={{
                  height: "100%",
                  textAlign: "center",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      color: theme.palette.primary.main,
                      mb: 2,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          py: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} textAlign="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: theme.palette.primary.main }}
              >
                24/7
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Cloud Availability
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: theme.palette.primary.main }}
              >
                100%
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Free to Use
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: theme.palette.primary.main }}
              >
                ∞
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Events & Reminders
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 } }}>
        <Box textAlign="center">
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700, mb: 3 }}
          >
            Ready to Transform Your Productivity?
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 500, mx: "auto" }}
          >
            Join thousands of users who have already discovered the power of
            smart time management with TimeBlock.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{
              px: 6,
              py: 2,
              fontSize: "1.2rem",
              fontWeight: 600,
              borderRadius: 2,
              color: grey[50],
            }}
          >
            {user ? "Open Dashboard" : "Start Your Journey"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
