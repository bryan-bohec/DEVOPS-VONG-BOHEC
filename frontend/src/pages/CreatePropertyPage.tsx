import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Container,
} from "@mui/material";
import { createProperty } from "../services/api";
import type { User } from "../types";

interface Props {
  user: User;
}

export default function CreatePropertyPage({ user }: Props) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "apartment",
    address: "",
    city: "",
    price_per_night: "",
    rooms: "",
    capacity: "",
    image_url: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createProperty({
        ...form,
        price_per_night: Number(form.price_per_night),
        rooms: Number(form.rooms),
        capacity: Number(form.capacity),
        owner_id: user.id,
      });
      navigate("/properties");
    } catch {
      setError("Erreur lors de la création du logement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ maxWidth: 640, mx: "auto" }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          Publier un logement
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Remplissez les informations de votre bien pour le mettre en ligne.
        </Typography>

        <Paper sx={{ p: { xs: 3, sm: 4 }, border: "1px solid", borderColor: "divider" }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Titre de l'annonce"
              placeholder="Ex : Bel appartement lumineux en centre-ville"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
              sx={{ mb: 2.5 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              placeholder="Décrivez votre logement, ses atouts, le quartier..."
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              sx={{ mb: 2.5 }}
            />

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Type de bien</InputLabel>
                  <Select
                    value={form.type}
                    label="Type de bien"
                    onChange={(e) => handleChange("type", e.target.value)}
                  >
                    <MenuItem value="apartment">Appartement</MenuItem>
                    <MenuItem value="house">Maison</MenuItem>
                    <MenuItem value="studio">Studio</MenuItem>
                    <MenuItem value="villa">Villa</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Ville"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  required
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Adresse"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              required
              sx={{ mb: 2.5 }}
            />

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Prix / nuit (€)"
                  type="number"
                  value={form.price_per_night}
                  onChange={(e) => handleChange("price_per_night", e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Pièces"
                  type="number"
                  value={form.rooms}
                  onChange={(e) => handleChange("rooms", e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Capacité"
                  type="number"
                  value={form.capacity}
                  onChange={(e) => handleChange("capacity", e.target.value)}
                  required
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="URL de l'image (optionnel)"
              placeholder="https://..."
              value={form.image_url}
              onChange={(e) => handleChange("image_url", e.target.value)}
              sx={{ mb: 4 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Mettre en ligne"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
