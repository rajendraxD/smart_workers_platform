import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Button, IconButton, Avatar,
  Menu, MenuItem, Box, Badge, Container,
} from "@mui/material";
import {
  Menu as MenuIcon, Notifications as NotifIcon,
  Dashboard, Work, Person, Logout,
} from "@mui/icons-material";
import { logoutUser } from "../../redux/slices/authSlice";

export default function Navbar({ onToggleSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleClose();
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: 1 }}>
          {isAuthenticated && (
            <IconButton color="inherit" edge="start" onClick={onToggleSidebar} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ textDecoration: "none", color: "inherit", fontWeight: 700, flexGrow: { xs: 1, md: 0 } }}
          >
            SmartWorkers
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {isAuthenticated ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton color="inherit" onClick={() => navigate("/notifications")}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotifIcon />
                </Badge>
              </IconButton>

              <IconButton onClick={handleMenu} size="small">
                <Avatar
                  src={user?.avatar}
                  sx={{ width: 34, height: 34, bgcolor: "primary.dark" }}
                >
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {user?.firstName} {user?.lastName}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); navigate("/dashboard"); }}>
                  <Dashboard fontSize="small" sx={{ mr: 1 }} /> Dashboard
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); navigate("/profile"); }}>
                  <Person fontSize="small" sx={{ mr: 1 }} /> Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button color="inherit" component={RouterLink} to="/login">Login</Button>
              <Button variant="outlined" color="inherit" component={RouterLink} to="/register">
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
