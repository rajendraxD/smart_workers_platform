import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Link, Alert, InputAdornment, Step, StepLabel, Stepper,
} from "@mui/material";
import { Email, Lock, CheckCircle } from "@mui/icons-material";
import axios from "../../utils/axios";

const steps = ["Verify Email", "Reset Password", "Done"];

export default function ForgotPassword() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/auth/forgot-password", { email });
      setActiveStep(1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/auth/reset-password", { email, otp, password });
      setActiveStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <Card sx={{ maxWidth: 480, width: "100%", mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom align="center">
            Reset Password
          </Typography>

          <Stepper activeStep={activeStep} sx={{ my: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Step 1: Enter Email */}
          {activeStep === 0 && (
            <Box component="form" onSubmit={handleSendOtp}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter your email address and we'll send you a password reset code.
              </Typography>
              <TextField
                fullWidth label="Email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Email fontSize="small" /></InputAdornment>,
                }}
              />
              <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Code"}
              </Button>
            </Box>
          )}

          {/* Step 2: Enter OTP + New Password */}
          {activeStep === 1 && (
            <Box component="form" onSubmit={handleResetPassword}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Check your email (or terminal in dev mode) for the 6-digit code.
              </Typography>
              <TextField
                fullWidth label="Reset Code" value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required sx={{ mb: 2 }}
                placeholder="000000"
                inputProps={{ maxLength: 6, style: { letterSpacing: 8, fontSize: "1.5rem", textAlign: "center" } }}
              />
              <TextField
                fullWidth label="New Password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} required sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock fontSize="small" /></InputAdornment>,
                }}
              />
              <TextField
                fullWidth label="Confirm Password" type="password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} required sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock fontSize="small" /></InputAdornment>,
                }}
              />
              <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </Box>
          )}

          {/* Step 3: Success */}
          {activeStep === 2 && (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>Password Reset Successful</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Your password has been updated. You can now sign in with your new password.
              </Typography>
              <Button fullWidth variant="contained" component={RouterLink} to="/login" size="large">
                Back to Sign In
              </Button>
            </Box>
          )}

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Back to Sign In
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
