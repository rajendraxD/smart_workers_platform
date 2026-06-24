import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Divider, Box,
} from "@mui/material";
import {
  Dashboard, Work, Person, Send, RateReview,
  AdminPanelSettings, Category,
} from "@mui/icons-material";

const DRAWER_WIDTH = 240;

const workerMenu = [
  { label: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { label: "Find Jobs", icon: <Work />, path: "/jobs" },
  { label: "My Applications", icon: <Send />, path: "/applications" },
  { label: "My Profile", icon: <Person />, path: "/profile" },
];

const clientMenu = [
  { label: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { label: "My Jobs", icon: <Work />, path: "/jobs?mine=true" },
  { label: "Post a Job", icon: <Work />, path: "/jobs/create" },
  { label: "My Profile", icon: <Person />, path: "/profile" },
];

const adminMenu = [
  { label: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { label: "Users", icon: <Person />, path: "/admin/users" },
  { label: "Jobs", icon: <Work />, path: "/admin/jobs" },
  { label: "Categories", icon: <Category />, path: "/admin/categories" },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const menuItems = user?.role === "admin" ? adminMenu
    : user?.role === "client" ? clientMenu
    : workerMenu;

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path.split("?")[0]}
                onClick={() => { navigate(item.path); onClose(); }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
