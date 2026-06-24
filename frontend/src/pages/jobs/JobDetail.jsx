import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Grid, Card, CardContent, Typography, Chip, Button,
  Avatar, Stack, Divider, TextField, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from "@mui/material";
import { LocationOn, BusinessCenter, AccessTime, Person } from "@mui/icons-material";
import { fetchJobById } from "../../redux/slices/jobSlice";
import { applyToJob } from "../../redux/slices/applicationSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { EXPERIENCE_LEVELS, DURATION_OPTIONS, JOB_STATUS_LABELS } from "../../utils/constants";

export default function JobDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentJob: job, loading } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);

  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    dispatch(fetchJobById(id));
  }, [dispatch, id]);

  const handleApply = async () => {
    try {
      await dispatch(applyToJob({ jobId: id, coverLetter, proposedRate: proposedRate ? Number(proposedRate) : undefined })).unwrap();
      setApplySuccess(true);
      setApplyOpen(false);
    } catch (err) {
      setApplyError(err);
    }
  };

  if (loading || !job) return <LoadingSpinner />;

  const expLabel = EXPERIENCE_LEVELS.find(l => l.value === job.experienceLevel)?.label;
  const durLabel = DURATION_OPTIONS.find(d => d.value === job.duration)?.label;

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box>
                  <Typography variant="h4" fontWeight={700}>{job.title}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                    <Chip label={JOB_STATUS_LABELS[job.status] || job.status} color={job.status === "open" ? "success" : "default"} size="small" />
                    {job.budgetType && <Chip label={job.budgetType} size="small" variant="outlined" />}
                  </Box>
                </Box>
                {user?.role === "worker" && job.status === "open" && (
                  <Button variant="contained" size="large" onClick={() => setApplyOpen(true)}>
                    Apply Now
                  </Button>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Description</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-wrap", mb: 3 }}>
                {job.description}
              </Typography>

              {job.skills?.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom>Skills Required</Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 3 }}>
                    {job.skills.map((skill) => (
                      <Chip key={skill} label={skill} variant="outlined" />
                    ))}
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Job Details</Typography>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BusinessCenter color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Budget</Typography>
                    <Typography fontWeight={600}>
                      ${job.budgetMin}{job.budgetMax ? ` - $${job.budgetMax}` : ""}
                    </Typography>
                  </Box>
                </Box>
                {expLabel && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Person color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Experience</Typography>
                      <Typography fontWeight={600}>{expLabel}</Typography>
                    </Box>
                  </Box>
                )}
                {durLabel && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTime color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Duration</Typography>
                      <Typography fontWeight={600}>{durLabel}</Typography>
                    </Box>
                  </Box>
                )}
                {job.location && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOn color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Location</Typography>
                      <Typography fontWeight={600}>{job.location}</Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Client</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar src={job.client?.avatar} sx={{ width: 48, height: 48 }}>
                  {job.client?.firstName?.[0]}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>
                    {job.client?.firstName} {job.client?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ⭐ {job.client?.averageRating || "New"} · {job.client?.totalReviews || 0} reviews
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Apply Dialog */}
      <Dialog open={applyOpen} onClose={() => setApplyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for this Job</DialogTitle>
        <DialogContent>
          {applyError && <Alert severity="error" sx={{ mb: 2 }}>{applyError}</Alert>}
          {applySuccess && <Alert severity="success" sx={{ mb: 2 }}>Application submitted!</Alert>}
          <TextField
            fullWidth multiline rows={5} label="Cover Letter"
            value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Tell the client why you're a great fit..."
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth label="Proposed Rate ($)" type="number"
            value={proposedRate} onChange={(e) => setProposedRate(e.target.value)}
            placeholder="Leave blank for original budget"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleApply}>Submit Application</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
