import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  CircularProgress,
  Container,
  Grid,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { register } from "../services/api";
import axios from "axios";
import type { User } from "../types";

interface Props {
  onLogin: (user: User, token: string) => void;
}

export default function RegisterPage({ onLogin }: Props) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "tenant",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (fieldErrors[field]) {
      setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.first_name.trim()) errs.first_name = "Le prénom est requis.";
    if (!form.last_name.trim()) errs.last_name = "Le nom est requis.";
    if (!form.email.trim()) errs.email = "L'email est requis.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "L'adresse email n'est pas valide.";
    if (!form.password) errs.password = "Le mot de passe est requis.";
    else if (form.password.length < 6) errs.password = "Le mot de passe doit contenir au moins 6 caractères.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await register(form);
      onLogin(res.data.user, res.data.accessToken);
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data;
        if (data.fieldErrors) {
          const errs: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(data.fieldErrors)) {
            if (Array.isArray(msgs) && msgs.length > 0) errs[key] = msgs[0] as string;
          }
          setFieldErrors(errs);
        }
        if (data.message) {
          setError(data.message);
        } else {
          setError("Erreur lors de l'inscription.");
        }
      } else {
        setError("Erreur lors de l'inscription.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ maxWidth: 480, mx: "auto" }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1, textAlign: "center" }}>
          Créer un compte
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, textAlign: "center" }}>
          Rejoignez LocaHome en quelques secondes
        </Typography>

        <Paper sx={{ p: { xs: 3, sm: 4 }, border: "1px solid", borderColor: "divider" }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mb: 0.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Prénom"
                  autoComplete="given-name"
                  value={form.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  required
                  error={!!fieldErrors.first_name}
                  helperText={fieldErrors.first_name}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nom"
                  autoComplete="family-name"
                  value={form.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  required
                  error={!!fieldErrors.last_name}
                  helperText={fieldErrors.last_name}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              sx={{ my: 2.5 }}
            />
            <TextField
              fullWidth
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
              error={!!fieldErrors.password}
              helperText={fieldErrors.password || "Minimum 6 caractères"}
              sx={{ mb: 2.5 }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Je suis</InputLabel>
              <Select
                value={form.role}
                label="Je suis"
                onChange={(e) => handleChange("role", e.target.value)}
              >
                <MenuItem value="tenant">Locataire — je cherche un logement</MenuItem>
                <MenuItem value="owner">Propriétaire — je propose un logement</MenuItem>
              </Select>
            </FormControl>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Créer mon compte"}
            </Button>
          </Box>
        </Paper>

        <Typography sx={{ mt: 3, textAlign: "center", color: "text.secondary" }}>
          Déjà inscrit ?{" "}
          <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
            Se connecter
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}
