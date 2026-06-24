import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { Home } from "@mui/icons-material";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <Typography variant="h1" fontWeight={800} color="primary.main" sx={{ fontSize: "6rem" }}>
        404
      </Typography>
      <Typography variant="h5" color="text.secondary" gutterBottom>
        Page not found
      </Typography>
      <Typography variant="body1" color="text.disabled" sx={{ mb: 3 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button variant="contained" startIcon={<Home />} onClick={() => navigate("/")}>
        Go Home
      </Button>
    </Box>
  );
}
