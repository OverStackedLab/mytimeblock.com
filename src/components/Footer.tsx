import { Box, Link, Typography, Stack } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        py: 2,
        px: 3,
        bgcolor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
        display: "grid",
        gridTemplateColumns: "200px 1fr 200px",
        alignItems: "center",
        zIndex: 100,
      }}
    >
      <Box /> {/* Left spacer */}
      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
        <Typography variant="body2" color="text.secondary">
          Powered by
        </Typography>
        <Link
          href="https://overstacked.dev"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          color="primary"
          sx={{ fontWeight: 500 }}
        >
          OverStacked
        </Link>
      </Box>
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Link
          href="https://github.com/OverStackedLab"
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
        >
          <GitHubIcon />
        </Link>
        <Link
          href="https://www.linkedin.com/in/joaquinguardado/"
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
        >
          <LinkedInIcon />
        </Link>
        <Link
          href="https://www.facebook.com/overstackedlabs/"
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
        >
          <FacebookIcon />
        </Link>
        <Link
          href="https://www.instagram.com/jqn.io/"
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
        >
          <InstagramIcon />
        </Link>
      </Stack>
    </Box>
  );
};

export default Footer;
