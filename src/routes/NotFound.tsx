import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import Header from "../components/Header";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <Header />
      <main>
        <Container maxWidth="sm">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "60vh",
              textAlign: "center",
              gap: 3,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "4rem", sm: "6rem" },
                fontWeight: 700,
                color: "#ff9800",
              }}
            >
              404
            </Typography>
            <Typography variant="h4" gutterBottom>
              Page Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Sorry, the page you're looking for doesn't exist or has been
              moved.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/")}
              sx={{
                mt: 2,
                backgroundColor: "#ff9800",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#f57c00",
                },
              }}
            >
              Go Back
            </Button>
          </Box>
        </Container>
      </main>
    </div>
  );
};

export default NotFound;
