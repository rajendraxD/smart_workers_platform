import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box, Grid, Card, CardContent, Typography, TextField, Chip,
  Button, Stack, MenuItem, InputAdornment, Pagination, Avatar,
} from "@mui/material";
import { Search, LocationOn, BusinessCenter } from "@mui/icons-material";
import { fetchJobs } from "../../redux/slices/jobSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { EXPERIENCE_LEVELS } from "../../utils/constants";

export default function JobList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobs, meta, loading } = useSelector((state) => state.jobs);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    skills: searchParams.get("skills") || "",
    experienceLevel: searchParams.get("experienceLevel") || "",
    page: Number(searchParams.get("page")) || 1,
  });

  useEffect(() => {
    dispatch(fetchJobs({ ...filters, limit: 12 }));
  }, [dispatch, filters]);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value, page: field === "page" ? value : 1 };
    setFilters(newFilters);
    setSearchParams(newFilters);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {searchParams.get("mine") === "true" ? "My Jobs" : "Find Work"}
      </Typography>

      {/* Search & Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth size="small" placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth size="small" select label="Experience"
                value={filters.experienceLevel}
                onChange={(e) => handleFilterChange("experienceLevel", e.target.value)}
              >
                <MenuItem value="">All Levels</MenuItem>
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <MenuItem key={lvl.value} value={lvl.value}>{lvl.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth size="small" placeholder="Skills (comma separated)"
                value={filters.skills}
                onChange={(e) => handleFilterChange("skills", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button fullWidth variant="outlined" onClick={() => setFilters({ search: "", skills: "", experienceLevel: "", page: 1 })}>
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Job Listings */}
      {loading ? (
        <LoadingSpinner />
      ) : jobs?.length === 0 ? (
        <EmptyState title="No jobs found" description="Try adjusting your search or filters" />
      ) : (
        <Grid container spacing={2}>
          {jobs.map((job) => (
            <Grid item xs={12} md={6} lg={4} key={job._id}>
              <Card
                sx={{ cursor: "pointer", "&:hover": { boxShadow: 4, transform: "translateY(-2px)", transition: "all 0.2s" } }}
                onClick={() => navigate(`/jobs/${job._id}`)}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.light" }}>
                      {job.client?.firstName?.[0]}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {job.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {job.client?.firstName} {job.client?.lastName}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }} noWrap>
                    {job.description}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                    <Chip
                      icon={<BusinessCenter />}
                      label={`$${job.budgetMin}${job.budgetMax ? ` - $${job.budgetMax}` : ""}`}
                      size="small" variant="outlined" color="primary"
                    />
                    {job.experienceLevel && (
                      <Chip label={EXPERIENCE_LEVELS.find(l => l.value === job.experienceLevel)?.label || job.experienceLevel} size="small" variant="outlined" />
                    )}
                  </Box>

                  {job.skills?.length > 0 && (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {job.skills.slice(0, 4).map((skill) => (
                        <Chip key={skill} label={skill} size="small" variant="outlined" />
                      ))}
                      {job.skills.length > 4 && (
                        <Chip label={`+${job.skills.length - 4}`} size="small" />
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {meta?.pages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={meta.pages}
            page={filters.page}
            onChange={(_, page) => handleFilterChange("page", page)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
