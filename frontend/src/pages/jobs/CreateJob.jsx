import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, MenuItem, Alert, Chip, Stack,
} from "@mui/material";
import { createJob } from "../../redux/slices/jobSlice";
import { EXPERIENCE_LEVELS, DURATION_OPTIONS } from "../../utils/constants";

export default function CreateJob() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.jobs);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "", description: "", category: "",
    budgetType: "fixed", budgetMin: "", budgetMax: "",
    skills: "", experienceLevel: "intermediate", duration: "",
    location: "", deadline: "",
  });

  const [skillList, setSkillList] = useState([]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddSkill = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      setSkillList([...skillList, e.target.value.trim()]);
      setForm({ ...form, skills: "" });
    }
  };

  const removeSkill = (skill) => setSkillList(skillList.filter(s => s !== skill));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const jobData = {
      ...form,
      skills: skillList,
      budgetMin: Number(form.budgetMin),
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      deadline: form.deadline || undefined,
    };

    try {
      await dispatch(createJob(jobData)).unwrap();
      navigate("/dashboard");
    } catch (err) {
      setError(err);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Post a Job</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Find the perfect talent for your project
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth label="Job Title" name="title" value={form.title} onChange={handleChange} required
                  placeholder="e.g., React Developer for E-commerce Website" />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth multiline rows={6} label="Description" name="description" value={form.description}
                  onChange={handleChange} required placeholder="Describe the project scope, requirements, and deliverables..." />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Budget Type" name="budgetType" value={form.budgetType} onChange={handleChange}>
                  <MenuItem value="fixed">Fixed Price</MenuItem>
                  <MenuItem value="hourly">Hourly Rate</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField fullWidth label="Min Budget ($)" name="budgetMin" type="number" value={form.budgetMin} onChange={handleChange} required />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth label="Max Budget ($)" name="budgetMax" type="number" value={form.budgetMax} onChange={handleChange} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Experience Level" name="experienceLevel" value={form.experienceLevel} onChange={handleChange}>
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <MenuItem key={lvl.value} value={lvl.value}>{lvl.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Duration" name="duration" value={form.duration} onChange={handleChange}>
                  <MenuItem value="">Any Duration</MenuItem>
                  {DURATION_OPTIONS.map((dur) => (
                    <MenuItem key={dur.value} value={dur.value}>{dur.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Location" name="location" value={form.location} onChange={handleChange}
                  placeholder="Remote / City name" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="date" label="Deadline" name="deadline" value={form.deadline}
                  onChange={handleChange} InputLabelProps={{ shrink: true }} />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Skills" name="skills" value={form.skills} onChange={handleChange}
                  onKeyDown={handleAddSkill} placeholder="Type a skill and press Enter" />
                <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
                  {skillList.map((skill) => (
                    <Chip key={skill} label={skill} onDelete={() => removeSkill(skill)} size="small" />
                  ))}
                </Stack>
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
              <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? "Posting..." : "Post Job"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
