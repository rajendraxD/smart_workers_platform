import { Typography } from "@mui/material";
import EmptyState from "../components/common/EmptyState";
import { NotificationsNone } from "@mui/icons-material";

export default function Notifications() {
  return (
    <EmptyState
      icon={<NotificationsNone sx={{ fontSize: 64 }} />}
      title="No notifications yet"
      description="When you receive messages, job updates, or other alerts, they'll appear here."
    />
  );
}
