import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar, Stack,
} from "@mui/material";
import {
  Work, Person, Star, TrendingUp, ArrowForward,
} from "@mui/icons-material";
import { fetchJobs } from "../redux/slices/jobSlice";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { jobs } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchJobs({ limit: 5 }));
  }, [dispatch]);

  const isWorker = user?.role === "worker";
  const isClient = user?.role === "client";

  const stats = isWorker
    ? [
        { label: "Jobs Applied", value: "0", icon: <Work />, color: "primary" },
        { label: "Active Proposals", value: "0", icon: <TrendingUp />, color: "secondary" },
        { label: "Completed Jobs", value: user?.completedJobs || 0, icon: <Star />, color: "success" },
        { label: "Rating", value: user?.averageRating || "-", icon: <Star />, color: "warning" },
      ]
    : [
        { label: "Posted Jobs", value: "0", icon: <Work />, color: "primary" },
        { label: "Active Jobs", value: "0", icon: <TrendingUp />, color: "secondary" },
        { label: "Total Hired", value: "0", icon: <Person />, color: "success" },
        { label: "Completed", value: "0", icon: <Star />, color: "warning" },
      ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Welcome back, {user?.firstName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your {isWorker ? "job search" : "projects"}
          </Typography>
        </Box>
        {isClient && (
          <Button variant="contained" onClick={() => navigate("/jobs/create")}>
            + Post a Job
          </Button>
        )}
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: `${stat.color}.light`, color: `${stat.color}.main`, width: 48, height: 48 }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Jobs */}
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              {isWorker ? "Latest Jobs" : "Your Recent Jobs"}
            </Typography>
            <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate("/jobs")}>
              View All
            </Button>
          </Box>

          {jobs?.length > 0 ? (
            <Stack spacing={2}>
              {jobs.slice(0, 5).map((job) => (
                <Box
                  key={job._id}
                  sx={{
                    p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider",
                    cursor: "pointer", "&:hover": { bgcolor: "action.hover" },
                  }}
                  onClick={() => navigate(`/jobs/${job._id}`)}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>{job.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {job.client?.firstName} {job.client?.lastName} · ${job.budgetMin}{job.budgetMax ? ` - $${job.budgetMax}` : ""}
                      </Typography>
                    </Box>
                    <Chip
                      label={job.status.replace("_", " ")}
                      size="small"
                      color={job.status === "open" ? "success" : "default"}
                    />
                  </Box>
                  {job.skills?.length > 0 && (
                    <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
                      {job.skills.slice(0, 4).map((skill) => (
                        <Chip key={skill} label={skill} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  )}
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
              No jobs to show yet.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
