import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb", // Blue 600
      light: "#60a5fa",
      dark: "#1d4ed8",
    },
    secondary: {
      main: "#7c3aed", // Violet 600
      light: "#a78bfa",
      dark: "#5b21b6",
    },
    success: { main: "#16a34a" },
    warning: { main: "#d97706" },
    error: { main: "#dc2626" },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, fontSize: "2.5rem" },
    h2: { fontWeight: 700, fontSize: "2rem" },
    h3: { fontWeight: 700, fontSize: "1.5rem" },
    h4: { fontWeight: 600, fontSize: "1.25rem" },
    h5: { fontWeight: 600, fontSize: "1.1rem" },
    h6: { fontWeight: 600, fontSize: "1rem" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: "8px 20px" },
        contained: { boxShadow: "none", "&:hover": { boxShadow: "none" } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { "& .MuiOutlinedInput-root": { borderRadius: 8 } },
      },
    },
  },
});

export default theme;
