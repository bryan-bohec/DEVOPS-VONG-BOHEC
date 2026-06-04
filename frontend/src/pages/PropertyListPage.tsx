import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Grid,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Container,
  InputAdornment,
} from "@mui/material";
import {
  SearchRounded,
  AddBusiness,
  Apartment,
  LocationOnOutlined,
  BedOutlined,
  PeopleOutlined,
} from "@mui/icons-material";
import { getProperties } from "../services/api";
import type { Property, User } from "../types";

type Props = Readonly<{
  user: User | null;
}>;

export default function PropertyListPage({ user }: Props) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState({ type: "", city: "", min_price: "", max_price: "" });
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.type) params.type = filters.type;
      if (filters.city) params.city = filters.city;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      const res = await getProperties(params);
      setProperties(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  const typeLabels: Record<string, string> = {
    apartment: "Appartement",
    house: "Maison",
    studio: "Studio",
    villa: "Villa",
  };

  const countLabel = `${properties.length} logement${properties.length === 1 ? "" : "s"} trouvé${properties.length === 1 ? "" : "s"}`;

  const renderResults = () => {
    if (loading) {
      return (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <CircularProgress sx={{ color: "primary.main" }} />
        </Box>
      );
    }

    if (properties.length === 0) {
      return (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <Apartment sx={{ fontSize: 56, color: "divider", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, color: "text.primary" }}>
            Aucun logement trouvé
          </Typography>
          <Typography color="text.secondary">
            Essayez de modifier vos filtres ou revenez plus tard.
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {properties.map((p) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardActionArea component={RouterLink} to={`/properties/${p.id}`} sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}>
                {p.image_url ? (
                  <CardMedia
                    component="img"
                    height={200}
                    image={p.image_url}
                    alt={p.title}
                    loading="lazy"
                    sx={{ borderRadius: "16px 16px 0 0" }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      bgcolor: "#F1F5F9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    role="img"
                    aria-label={`Image non disponible pour ${p.title}`}
                  >
                    <Apartment sx={{ fontSize: 48, color: "#CBD5E1" }} />
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                  <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                      {p.title}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LocationOnOutlined sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      {p.city} · {typeLabels[p.type] || p.type}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      icon={<BedOutlined sx={{ fontSize: 16 }} />}
                      label={`${p.rooms} pièces`}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: "divider" }}
                    />
                    <Chip
                      icon={<PeopleOutlined sx={{ fontSize: 16 }} />}
                      label={`${p.capacity} pers.`}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: "divider" }}
                    />
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: "primary.main", fontVariantNumeric: "tabular-nums" }}>
                    {p.price_per_night} €
                    <Typography component="span" variant="body2" sx={{ fontWeight: 400, color: "text.secondary" }}>
                      {" "}/ nuit
                    </Typography>
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
            Logements disponibles
          </Typography>
          <Typography color="text.secondary">{loading ? "Chargement..." : countLabel}</Typography>
        </Box>
        {user?.role === "owner" && (
          <Button
            variant="contained"
            component={RouterLink}
            to="/properties/new"
            startIcon={<AddBusiness />}
          >
            Publier un logement
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Paper
        component="form"
        onSubmit={handleSearch}
        sx={{ p: 2.5, mb: 4, border: "1px solid", borderColor: "divider" }}
      >
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="apartment">Appartement</MenuItem>
                <MenuItem value="house">Maison</MenuItem>
                <MenuItem value="studio">Studio</MenuItem>
                <MenuItem value="villa">Villa</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              fullWidth
              size="small"
              label="Ville"
              placeholder="Paris, Lyon..."
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnOutlined sx={{ fontSize: 18, color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Prix min (€)"
              type="number"
              value={filters.min_price}
              onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Prix max (€)"
              type="number"
              value={filters.max_price}
              onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button fullWidth type="submit" variant="contained" startIcon={<SearchRounded />} sx={{ height: 40 }}>
              Rechercher
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results */}
      {renderResults()}
    </Container>
  );
}
