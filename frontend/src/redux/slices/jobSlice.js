import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";

export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/jobs", { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch jobs");
    }
  }
);

export const fetchJobById = createAsyncThunk(
  "jobs/fetchJobById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/jobs/${id}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch job");
    }
  }
);

export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/jobs", jobData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create job");
    }
  }
);

const initialState = {
  jobs: [],
  currentJob: null,
  meta: { page: 1, total: 0, pages: 0 },
  loading: false,
  error: null,
};

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs;
        state.meta = action.meta;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload.job;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload.job);
      });
  },
});

export const { clearCurrentJob, clearError } = jobSlice.actions;
export default jobSlice.reducer;
