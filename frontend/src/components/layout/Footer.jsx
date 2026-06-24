import { Box, Container, Typography, Link } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{ py: 3, mt: "auto", bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider" }}
    >
      <Container maxWidth="xl">
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Smart Workers Platform. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
