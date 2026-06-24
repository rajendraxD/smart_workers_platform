import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";

export const fetchMyApplications = createAsyncThunk(
  "applications/fetchMyApplications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/applications/my", { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch applications");
    }
  }
);

export const applyToJob = createAsyncThunk(
  "applications/apply",
  async ({ jobId, ...body }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`/applications/jobs/${jobId}`, body);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to apply");
    }
  }
);

const initialState = {
  applications: [],
  loading: false,
  error: null,
};

const applicationSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    filterOutApplication: (state, action) => {
      state.applications = state.applications.filter((a) => a._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload.applications;
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(applyToJob.fulfilled, (state, action) => {
        state.applications.unshift(action.payload.application);
      });
  },
});

export const { clearError, filterOutApplication } = applicationSlice.actions;
export default applicationSlice.reducer;
