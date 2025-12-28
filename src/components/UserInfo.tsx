import { Avatar, Box, Typography } from "@mui/material";
import { useContext } from "react";
import { Context } from "../context/AuthContext";

const UserInfo = () => {
  const { user } = useContext(Context);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
      <Avatar sx={{ bgcolor: "primary.main" }}>
        {user?.email?.[0].toUpperCase() || "?"}
      </Avatar>
      <Typography>{user?.email || "Not signed in"}</Typography>
    </Box>
  );
};

export default UserInfo;
