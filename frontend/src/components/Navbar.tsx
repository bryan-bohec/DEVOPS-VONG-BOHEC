import { useState } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home,
  Apartment,
  AddBusiness,
  Dashboard,
  BookOnline,
  Logout,
  Login,
  PersonAdd,
  KeyboardArrowDown,
} from "@mui/icons-material";
import type { User } from "../types";

type Props = Readonly<{
  user: User | null;
  onLogout: () => void;
}>;

export default function Navbar({ user, onLogout }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleLogout = () => {
    setAnchorEl(null);
    setDrawerOpen(false);
    onLogout();
    navigate("/");
  };

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const mobileLinks = [
    { label: "Accueil", to: "/", icon: <Home /> },
    { label: "Logements", to: "/properties", icon: <Apartment /> },
    ...(user?.role === "owner"
      ? [
          { label: "Publier une annonce", to: "/properties/new", icon: <AddBusiness /> },
          { label: "Dashboard", to: "/dashboard", icon: <Dashboard /> },
        ]
      : []),
    ...(user
      ? [{ label: "Mes réservations", to: "/my-bookings", icon: <BookOnline /> }]
      : []),
  ];

  const navLinkSx = (path: string) => ({
    color: isActive(path) ? "primary.main" : "text.secondary",
    fontWeight: isActive(path) ? 700 : 500,
    fontSize: "0.9rem",
    borderRadius: 2,
    px: 2,
    "&:hover": {
      bgcolor: "rgba(15, 118, 110, 0.06)",
      color: "primary.main",
    },
  });

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ maxWidth: 1200, width: "100%", mx: "auto", px: { xs: 2, md: 3 } }}>
        {isMobile && (
          <IconButton
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 1, color: "text.primary" }}
            aria-label="Ouvrir le menu de navigation"
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h5"
          component={RouterLink}
          to="/"
          sx={{
            textDecoration: "none",
            color: "primary.main",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            mr: 5,
            fontSize: "1.5rem",
          }}
        >
          LocaHome
        </Typography>

        {!isMobile && (
          <Box sx={{ flexGrow: 1, display: "flex", gap: 0.5 }}>
            <Button component={RouterLink} to="/properties" sx={navLinkSx("/properties")}>
              Logements
            </Button>
            {user?.role === "owner" && (
              <>
                <Button component={RouterLink} to="/properties/new" sx={navLinkSx("/properties/new")}>
                  Publier
                </Button>
                <Button component={RouterLink} to="/dashboard" sx={navLinkSx("/dashboard")}>
                  Dashboard
                </Button>
              </>
            )}
            {user && (
              <Button component={RouterLink} to="/my-bookings" sx={navLinkSx("/my-bookings")}>
                Réservations
              </Button>
            )}
          </Box>
        )}

        <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

        {user ? (
          <>
            <Button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                textTransform: "none",
                color: "text.primary",
                borderRadius: 3,
                px: 1.5,
                "&:hover": { bgcolor: "action.hover" },
              }}
              startIcon={
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "primary.main",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                >
                  {user.first_name.charAt(0)}
                </Avatar>
              }
              endIcon={<KeyboardArrowDown sx={{ fontSize: 18 }} />}
            >
              <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "left" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user.first_name}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1 }}>
                  {user.role === "owner" ? "Propriétaire" : "Locataire"}
                </Typography>
              </Box>
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              slotProps={{
                paper: {
                  sx: { minWidth: 180, mt: 1, borderRadius: 3 },
                },
              }}
            >
              <MenuItem onClick={handleLogout} sx={{ gap: 1.5, color: "error.main" }}>
                <Logout fontSize="small" /> Déconnexion
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              component={RouterLink}
              to="/login"
              sx={{ color: "text.primary", fontWeight: 500 }}
            >
              Connexion
            </Button>
            <Button
              variant="contained"
              component={RouterLink}
              to="/register"
              startIcon={<PersonAdd sx={{ fontSize: 18 }} />}
            >
              Inscription
            </Button>
          </Box>
        )}
      </Toolbar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280, pt: 2 }} role="navigation" aria-label="Menu principal">
          <Typography
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: "1.3rem",
              color: "primary.main",
              px: 3,
              pb: 2,
              letterSpacing: "-0.03em",
            }}
          >
            LocaHome
          </Typography>
          <Divider />
          <List sx={{ px: 1, pt: 1 }}>
            {mobileLinks.map((link) => (
              <ListItem key={link.to} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={link.to}
                  selected={isActive(link.to)}
                  onClick={() => setDrawerOpen(false)}
                  sx={{ borderRadius: 2, mb: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: isActive(link.to) ? "primary.main" : "text.secondary" }}>
                    {link.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={link.label}
                    slotProps={{ primary: { sx: { fontWeight: isActive(link.to) ? 600 : 400 } } }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          {user ? (
            <List sx={{ px: 1 }}>
              <ListItem sx={{ px: 2, py: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", mr: 2, fontSize: "0.9rem" }}>
                  {user.first_name.charAt(0)}
                </Avatar>
                <ListItemText
                  primary={`${user.first_name} ${user.last_name}`}
                  secondary={user.role === "owner" ? "Propriétaire" : "Locataire"}
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: "error.main" }}>
                  <ListItemIcon sx={{ minWidth: 40, color: "error.main" }}><Logout /></ListItemIcon>
                  <ListItemText primary="Déconnexion" />
                </ListItemButton>
              </ListItem>
            </List>
          ) : (
            <List sx={{ px: 1 }}>
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/login" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><Login /></ListItemIcon>
                  <ListItemText primary="Connexion" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/register" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><PersonAdd /></ListItemIcon>
                  <ListItemText primary="Inscription" />
                </ListItemButton>
              </ListItem>
            </List>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
}
