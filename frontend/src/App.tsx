import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { ThemeProvider, createTheme, CssBaseline, Container, Box, CircularProgress } from "@mui/material";
import Navbar from "./components/Navbar";
import { getCurrentUser, setAuthToken } from "./services/api";
import type { User } from "./types";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const PropertyListPage = lazy(() => import("./pages/PropertyListPage"));
const PropertyDetailPage = lazy(() => import("./pages/PropertyDetailPage"));
const CreatePropertyPage = lazy(() => import("./pages/CreatePropertyPage"));
const MyBookingsPage = lazy(() => import("./pages/MyBookingsPage"));
const OwnerDashboard = lazy(() => import("./pages/OwnerDashboard"));

const theme = createTheme({
  palette: {
    primary: {
      main: "#0F766E",
      light: "#14B8A6",
      dark: "#0D5C56",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#0369A1",
      contrastText: "#FFFFFF",
    },
    success: { main: "#16A34A" },
    warning: { main: "#D97706" },
    error: { main: "#DC2626" },
    info: { main: "#0284C7" },
    background: {
      default: "#F8FAFB",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
    },
    divider: "#E2E8F0",
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontFamily: "'Outfit', sans-serif", fontWeight: 600, letterSpacing: "-0.01em" },
    h4: { fontFamily: "'Outfit', sans-serif", fontWeight: 600, letterSpacing: "-0.01em" },
    h5: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
    button: { textTransform: "none" as const, fontWeight: 600, letterSpacing: "0.01em" },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none" as const,
          fontWeight: 600,
        },
        sizeLarge: { padding: "12px 28px", fontSize: "1rem" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          border: "1px solid #F1F5F9",
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
          "&:hover": {
            boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: "#F8FAFB",
            color: "#1E293B",
            fontWeight: 600,
            borderBottom: "2px solid #E2E8F0",
            fontFamily: "'Outfit', sans-serif",
            fontSize: "0.85rem",
            letterSpacing: "0.03em",
            textTransform: "uppercase" as const,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:last-child td": { borderBottom: 0 },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none" as const,
          fontWeight: 600,
          fontSize: "0.95rem",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16 },
      },
    },
  },
});

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      setAuthToken(token);
      try {
        const response = await getCurrentUser();
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch {
        setAuthToken(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    };
    restoreSession();
  }, []);

  const handleLogin = (u: User, token: string) => {
    setAuthToken(token);
    setUser(u);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(u));
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <Navbar user={user} onLogout={handleLogout} />
        <Box component="main" id="main-content">
          <Suspense
            fallback={
              <Container maxWidth="lg" sx={{ textAlign: "center", py: 12 }}>
                <CircularProgress sx={{ color: "primary.main" }} />
              </Container>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage user={user} />} />
              <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} />
              <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage onLogin={handleLogin} />} />
              <Route path="/properties" element={<PropertyListPage user={user} />} />
              <Route path="/properties/new" element={user?.role === "owner" ? <CreatePropertyPage user={user} /> : <Navigate to="/login" />} />
              <Route path="/properties/:id" element={<PropertyDetailPage user={user} />} />
              <Route path="/my-bookings" element={user ? <MyBookingsPage user={user} /> : <Navigate to="/login" />} />
              <Route path="/dashboard" element={user?.role === "owner" ? <OwnerDashboard user={user} /> : <Navigate to="/login" />} />
            </Routes>
          </Suspense>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
