import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Link, Alert, InputAdornment, IconButton, ToggleButtonGroup, ToggleButton,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock, Person, Business } from "@mui/icons-material";
import { registerUser, clearError } from "../../redux/slices/authSlice";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", role: "worker",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(form));
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <Card sx={{ maxWidth: 480, width: "100%", mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom align="center">
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Join Smart Workers today
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField fullWidth label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
              <TextField fullWidth label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required />
            </Box>

            <TextField
              fullWidth label="Email" name="email" type="email" value={form.email}
              onChange={handleChange} required sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email fontSize="small" /></InputAdornment>,
              }}
            />

            <TextField
              fullWidth label="Password" name="password"
              type={showPassword ? "text" : "password"} value={form.password}
              onChange={handleChange} required sx={{ mb: 2 }}
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

            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
              I want to...
            </Typography>
            <ToggleButtonGroup
              value={form.role}
              exclusive
              onChange={(_, val) => val && setForm({ ...form, role: val })}
              fullWidth
              sx={{ mb: 3 }}
            >
              <ToggleButton value="worker" sx={{ py: 1.5 }}>
                <Person sx={{ mr: 1 }} /> Find Work
              </ToggleButton>
              <ToggleButton value="client" sx={{ py: 1.5 }}>
                <Business sx={{ mr: 1 }} /> Hire Talent
              </ToggleButton>
            </ToggleButtonGroup>

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </Box>

          <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 2 }}>
            Already have an account?{" "}
            <Link component={RouterLink} to="/login" fontWeight={600}>
              Sign In
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
