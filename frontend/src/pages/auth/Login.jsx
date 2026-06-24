import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Link, Alert, InputAdornment, IconButton, Divider,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { loginUser, clearError } from "../../redux/slices/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <Card sx={{ maxWidth: 440, width: "100%", mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom align="center">
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Sign in to your Smart Workers account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email fontSize="small" /></InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              required
              sx={{ mb: 1 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock fontSize="small" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ textAlign: "right", mb: 2 }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Box>

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>or</Divider>

          <Typography variant="body2" align="center" color="text.secondary">
            Don't have an account?{" "}
            <Link component={RouterLink} to="/register" fontWeight={600}>
              Sign Up
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
