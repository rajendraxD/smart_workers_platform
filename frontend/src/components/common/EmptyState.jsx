import { Box, Typography, Button } from "@mui/material";
import { InboxOutlined } from "@mui/icons-material";

export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <Box sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}>
        {icon || <InboxOutlined sx={{ fontSize: 64 }} />}
      </Box>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title || "Nothing here yet"}
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mb: 3, maxWidth: 400, mx: "auto" }}>
        {description || ""}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>{actionLabel}</Button>
      )}
    </Box>
  );
}
