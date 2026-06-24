import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { Toaster } from "react-hot-toast";
import theme from "./theme/theme";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import JobList from "./pages/jobs/JobList";
import JobDetail from "./pages/jobs/JobDetail";
import CreateJob from "./pages/jobs/CreateJob";
import MyApplications from "./pages/applications/MyApplications";
import ApplicationDetail from "./pages/applications/ApplicationDetail";
import Profile from "./pages/profile/Profile";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: "8px", background: "#333", color: "#fff" },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Auth pages — no layout wrapper */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* App pages — with layout */}
          <Route element={<MainLayout />}>
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/jobs/create" element={<ProtectedRoute roles={["client"]}><CreateJob /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
            <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetail /></ProtectedRoute>} />

            {/* Public routes */}
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/jobs" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
