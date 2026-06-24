import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Grid, Card, CardContent, Typography, Chip, Button,
  Avatar, Stack, Divider, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import { ArrowBack, BusinessCenter, AccessTime } from "@mui/icons-material";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { APPLICATION_STATUS_LABELS } from "../../utils/constants";
import axios from "../../utils/axios";

const statusColors = {
  pending: "warning",
  accepted: "success",
  rejected: "error",
  withdrawn: "default",
  shortlisted: "info",
};

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`/applications/${id}`)
      .then(({ data }) => setApp(data.data.application))
      .catch((err) => setError(err.response?.data?.message || "Failed to load application"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      const { data } = await axios.patch(`/applications/${id}/status`, { status: "withdrawn" });
      setApp(data.data.application);
      setWithdrawOpen(false);
      toast.success("Application withdrawn");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to withdraw");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!app) return <Alert severity="error">Application not found</Alert>;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate("/applications")} sx={{ mb: 2 }}>
        Back to Applications
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box>
                  <Typography variant="h4" fontWeight={700}>{app.job?.title || "Unknown Job"}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                    <Chip
                      label={APPLICATION_STATUS_LABELS[app.status] || app.status}
                      color={statusColors[app.status] || "default"}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                {app.status === "pending" && (
                  <Button color="error" variant="outlined" onClick={() => setWithdrawOpen(true)}>
                    Withdraw
                  </Button>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {app.coverLetter && (
                <>
                  <Typography variant="h6" gutterBottom>Cover Letter</Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-wrap", mb: 3 }}>
                    {app.coverLetter}
                  </Typography>
                </>
              )}

              {app.clientNotes && (
                <>
                  <Typography variant="h6" gutterBottom>Client Notes</Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                    {app.clientNotes}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Application Details</Typography>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BusinessCenter color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Proposed Rate</Typography>
                    <Typography fontWeight={600}>
                      {app.proposedRate ? `$${app.proposedRate}/hr` : "Negotiable"}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTime color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                    <Typography fontWeight={600}>
                      {new Date(app.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Client</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar src={app.job?.client?.avatar} sx={{ width: 48, height: 48 }}>
                  {app.job?.client?.firstName?.[0]}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>
                    {app.job?.client?.firstName} {app.job?.client?.lastName}
                  </Typography>
                  <Button size="small" onClick={() => navigate(`/jobs/${app.job?._id}`)}>
                    View Job
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={withdrawOpen} onClose={() => setWithdrawOpen(false)}>
        <DialogTitle>Withdraw Application?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to withdraw this application? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleWithdraw} disabled={withdrawing}>
            {withdrawing ? "Withdrawing..." : "Withdraw"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
