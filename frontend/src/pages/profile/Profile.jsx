import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  Avatar, Chip, Stack, Divider, Alert,
} from "@mui/material";
import { Edit, Save, Cancel } from "@mui/icons-material";
import { MenuItem } from "@mui/material";
import axios from "../../utils/axios";

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  // Initialize with defaults to prevent uncontrolled->controlled warnings
  const getDefaultForm = (u) => ({
    firstName: u?.firstName || "",
    lastName: u?.lastName || "",
    phone: u?.phone || "",
    bio: u?.bio || "",
    skills: u?.skills?.join(", ") || "",
    hourlyRate: u?.hourlyRate || "",
    availability: u?.availability || "available",
    company: u?.company || "",
  });

  const [form, setForm] = useState(getDefaultForm(user));

  useEffect(() => {
    if (user) {
      setForm(getDefaultForm(user));
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        skills: form.skills ? form.skills.split(",").map(s => s.trim()) : [],
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
      };
      await axios.put("/users/profile", payload);
      setMessage("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>My Profile</Typography>
        <Button
          variant={editing ? "outlined" : "contained"}
          startIcon={editing ? <Cancel /> : <Edit />}
          onClick={() => editing ? setEditing(false) : setEditing(true)}
        >
          {editing ? "Cancel" : "Edit Profile"}
        </Button>
      </Box>

      {message && <Alert severity={message.includes("success") ? "success" : "error"} sx={{ mb: 2 }}>{message}</Alert>}

      <Grid container spacing={3}>
        {/* Avatar & Basic Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Avatar
                src={user?.avatar}
                sx={{ width: 120, height: 120, mx: "auto", mb: 2, bgcolor: "primary.main", fontSize: 48 }}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
              <Typography variant="h5" fontWeight={600}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Chip label={user?.role} size="small" color="primary" sx={{ mt: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                ⭐ {user?.averageRating || "No ratings yet"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.totalReviews || 0} reviews · {user?.completedJobs || 0} jobs completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Editable Fields */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>Profile Information</Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField fullWidth label="First Name" name="firstName" value={form.firstName}
                    onChange={handleChange} disabled={!editing} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Last Name" name="lastName" value={form.lastName}
                    onChange={handleChange} disabled={!editing} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Email" value={user?.email} disabled />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Phone" name="phone" value={form.phone}
                    onChange={handleChange} disabled={!editing} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Company" name="company" value={form.company}
                    onChange={handleChange} disabled={!editing} placeholder={user?.role === "client" ? "Your company name" : ""} />
                </Grid>

                {user?.role === "worker" && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Hourly Rate ($)" name="hourlyRate" type="number" value={form.hourlyRate}
                        onChange={handleChange} disabled={!editing} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth select label="Availability" name="availability" value={form.availability}
                        onChange={handleChange} disabled={!editing}>
                        <MenuItem value="available">Available</MenuItem>
                        <MenuItem value="busy">Busy</MenuItem>
                        <MenuItem value="unavailable">Unavailable</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Skills (comma separated)" name="skills" value={form.skills}
                        onChange={handleChange} disabled={!editing}
                        placeholder="React, Node.js, MongoDB, ..." />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={4} label="Bio" name="bio" value={form.bio}
                    onChange={handleChange} disabled={!editing}
                    placeholder="Tell us about yourself..." />
                </Grid>
              </Grid>

              {editing && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                  <Button variant="contained" startIcon={<Save />} size="large" onClick={handleSave}>
                    Save Changes
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
