import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";import { Box, Typography, Card, CardContent, Chip, Tabs, Tab,
  Stack, Button, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions,
} from "@mui/material";
import { Work, CheckCircle, Cancel, HourglassEmpty } from "@mui/icons-material";
import toast from "react-hot-toast";
import { fetchMyApplications, filterOutApplication } from "../../redux/slices/applicationSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { APPLICATION_STATUS_LABELS } from "../../utils/constants";
import axios from "../../utils/axios";

const STATUS_TABS = [
  { label: "All", value: "all", icon: <Work /> },
  { label: "Pending", value: "pending", icon: <HourglassEmpty /> },
  { label: "Accepted", value: "accepted", icon: <CheckCircle color="success" /> },
  { label: "Rejected", value: "rejected", icon: <Cancel color="error" /> },
];

const statusColors = {
  pending: "warning",
  accepted: "success",
  rejected: "error",
  withdrawn: "default",
  shortlisted: "info",
};

export default function MyApplications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { applications, loading } = useSelector((state) => state.applications);
  const [statusTab, setStatusTab] = useState("all");
  const [withdrawId, setWithdrawId] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    dispatch(fetchMyApplications(statusTab !== "all" ? { status: statusTab } : {}));
  }, [dispatch, statusTab]);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await axios.patch(`/applications/${withdrawId}/status`, { status: "withdrawn" });
      // Optimistic update: remove from local state
      dispatch(filterOutApplication(withdrawId));
      setWithdrawId(null);
      toast.success("Application withdrawn");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to withdraw");
      // Re-fetch on error to restore state
      dispatch(fetchMyApplications(statusTab !== "all" ? { status: statusTab } : {}));
    } finally {
      setWithdrawing(false);
    }
  };

  const filtered = statusTab === "all"
    ? applications
    : applications.filter((a) => a.status === statusTab);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>My Applications</Typography>

      <Card sx={{ mb: 3 }}>
        <Tabs
          value={statusTab}
          onChange={(_, v) => setStatusTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {STATUS_TABS.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} icon={tab.icon} iconPosition="start" />
          ))}
        </Tabs>
      </Card>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Work sx={{ fontSize: 64 }} />}
          title={statusTab === "all" ? "No applications yet" : `No ${statusTab} applications`}
          description={statusTab === "all" ? "Browse jobs and apply to get started" : ""}
          actionLabel={statusTab === "all" ? "Find Jobs" : undefined}
          onAction={statusTab === "all" ? () => navigate("/jobs") : undefined}
        />
      ) : (
        <Stack spacing={2}>
          {filtered.map((app) => (
            <Card
              key={app._id}
              sx={{ cursor: "pointer", "&:hover": { boxShadow: 3 } }}
              onClick={() => navigate(`/applications/${app._id}`)}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                      <Avatar src={app.job?.client?.avatar} sx={{ width: 36, height: 36, bgcolor: "primary.light" }}>
                        {app.job?.client?.firstName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {app.job?.title || "Unknown Job"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {app.job?.client?.firstName} {app.job?.client?.lastName}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Chip
                        label={APPLICATION_STATUS_LABELS[app.status] || app.status}
                        color={statusColors[app.status] || "default"}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                      </Typography>
                      {app.proposedRate && (
                        <Typography variant="caption" color="primary.main" fontWeight={600}>
                          ${app.proposedRate}/hr
                        </Typography>
                      )}
                    </Box>

                    {app.coverLetter && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} noWrap>
                        {app.coverLetter}
                      </Typography>
                    )}
                  </Box>

                  {app.status === "pending" && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{ ml: 2, flexShrink: 0 }}
                      onClick={(e) => { e.stopPropagation(); setWithdrawId(app._id); }}
                    >
                      Withdraw
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Withdraw Confirmation Dialog */}
      <Dialog open={!!withdrawId} onClose={() => setWithdrawId(null)}>
        <DialogTitle>Withdraw Application?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to withdraw this application? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleWithdraw} disabled={withdrawing}>
            {withdrawing ? "Withdrawing..." : "Withdraw"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
