import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  Chip,
  CircularProgress,
  Divider,
  Breadcrumbs,
  Link,
  Container,
} from "@mui/material";
import {
  Apartment,
  LocationOnOutlined,
  PeopleOutlined,
  BedOutlined,
  CalendarMonthOutlined,
  NavigateNext,
} from "@mui/icons-material";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import { fr } from "react-day-picker/locale";
import { eachDayOfInterval, startOfDay, format } from "date-fns";
import "react-day-picker/style.css";
import { getProperty, getPropertyBookedDates, createBooking } from "../services/api";
import type { Property, User } from "../types";

interface Props {
  user: User | null;
}

export default function PropertyDetailPage({ user }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [bookedRanges, setBookedRanges] = useState<{ from: Date; to: Date }[]>([]);
  const [bookingMsg, setBookingMsg] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const today = startOfDay(new Date());

  const disabledDays = useMemo(() => {
    const days: Date[] = [];
    for (const range of bookedRanges) {
      const interval = eachDayOfInterval({ start: range.from, end: range.to });
      days.push(...interval);
    }
    return days;
  }, [bookedRanges]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getProperty(Number(id)),
      getPropertyBookedDates(Number(id)),
    ])
      .then(([propRes, datesRes]) => {
        setProperty(propRes.data);
        setBookedRanges(
          datesRes.data.map((d) => ({
            from: startOfDay(new Date(d.check_in)),
            to: startOfDay(new Date(d.check_out)),
          })),
        );
      })
      .catch(() => navigate("/properties"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const days =
    dateRange?.from && dateRange?.to
      ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

  const handleBooking = async () => {
    if (!user || !property || !dateRange?.from || !dateRange?.to) return;
    setBookingMsg("");
    setBookingError("");

    if (days <= 0) {
      setBookingError("La date de départ doit être après la date d'arrivée.");
      return;
    }

    setBookingLoading(true);
    try {
      await createBooking({
        property_id: property.id,
        tenant_id: user.id,
        check_in: format(dateRange.from, "yyyy-MM-dd"),
        check_out: format(dateRange.to, "yyyy-MM-dd"),
        total_price: days * property.price_per_night,
      });
      setBookingMsg(`Réservation confirmée ! Total : ${days * property.price_per_night} € pour ${days} nuit(s).`);
      setDateRange(undefined);
      // Refresh booked dates
      getPropertyBookedDates(property.id).then((res) =>
        setBookedRanges(
          res.data.map((d) => ({
            from: startOfDay(new Date(d.check_in)),
            to: startOfDay(new Date(d.check_out)),
          })),
        ),
      );
    } catch {
      setBookingError("Ce logement est déjà réservé pour ces dates.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: "center", py: 12 }}>
        <CircularProgress sx={{ color: "primary.main" }} />
      </Container>
    );
  }

  if (!property) return null;

  const typeLabels: Record<string, string> = {
    apartment: "Appartement",
    house: "Maison",
    studio: "Studio",
    villa: "Villa",
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          Accueil
        </Link>
        <Link component={RouterLink} to="/properties" underline="hover" color="inherit">
          Logements
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 500 }}>{property.title}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Left: Image + Info */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ overflow: "hidden", border: "1px solid", borderColor: "divider", mb: 3 }}>
            {property.image_url ? (
              <Box
                component="img"
                src={property.image_url}
                alt={property.title}
                sx={{ width: "100%", height: { xs: 260, md: 400 }, objectFit: "cover", display: "block" }}
              />
            ) : (
              <Box
                sx={{
                  height: { xs: 260, md: 400 },
                  bgcolor: "#F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                role="img"
                aria-label={`Image non disponible pour ${property.title}`}
              >
                <Apartment sx={{ fontSize: 80, color: "#CBD5E1" }} />
              </Box>
            )}
          </Paper>

          <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
            {property.title}
          </Typography>

          <Box sx={{ mb: 3, color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5 }}>
            <LocationOnOutlined fontSize="small" />
            <Typography>{property.address}, {property.city}</Typography>
          </Box>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
              { icon: <Apartment fontSize="small" />, label: "Type", value: typeLabels[property.type] || property.type },
              { icon: <BedOutlined fontSize="small" />, label: "Pièces", value: property.rooms },
              { icon: <PeopleOutlined fontSize="small" />, label: "Capacité", value: `${property.capacity} pers.` },
              { icon: <CalendarMonthOutlined fontSize="small" />, label: "Prix / nuit", value: `${property.price_per_night} €` },
            ].map((item) => (
              <Grid size={{ xs: 6, sm: 3 }} key={item.label}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, textAlign: "center", borderColor: "divider" }}
                >
                  <Box sx={{ color: "primary.main", mb: 0.5 }}>{item.icon}</Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.25 }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>{item.value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {property.description && (
            <>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
                Description
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
                {property.description}
              </Typography>
            </>
          )}
        </Grid>

        {/* Right: Booking sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              position: { md: "sticky" },
              top: { md: 88 },
            }}
          >
            <Box sx={{ mb: 0.5, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {property.price_per_night} €
                <Typography component="span" variant="body2" sx={{ fontWeight: 400, color: "text.secondary" }}>
                  {" "}/ nuit
                </Typography>
              </Typography>
              <Chip
                label={property.is_available ? "Disponible" : "Indisponible"}
                color={property.is_available ? "success" : "error"}
                size="small"
              />
            </Box>

            <Divider sx={{ my: 2.5 }} />

            {user && user.role === "tenant" && property.is_available ? (
              <>
                {bookingMsg && <Alert severity="success" sx={{ mb: 2 }}>{bookingMsg}</Alert>}
                {bookingError && <Alert severity="error" sx={{ mb: 2 }}>{bookingError}</Alert>}

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Sélectionnez vos dates (arrivée → départ)
                </Typography>

                <Box
                  sx={{
                    "& .rdp-root": {
                      "--rdp-accent-color": "var(--mui-palette-primary-main, #1976d2)",
                      "--rdp-accent-background-color": "var(--mui-palette-primary-light, #e3f2fd)",
                      "--rdp-range_middle-background-color": "var(--mui-palette-primary-light, #e3f2fd)",
                      "--rdp-range_middle-color": "var(--mui-palette-primary-dark, #0d47a1)",
                      fontSize: "0.85rem",
                      width: "100%",
                    },
                    "& .rdp-disabled": {
                      color: "#ccc !important",
                      textDecoration: "line-through",
                      backgroundColor: "#fef2f2 !important",
                    },
                    mb: 2,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <DayPicker
                    mode="range"
                    locale={fr}
                    selected={dateRange}
                    onSelect={setDateRange}
                    disabled={[
                      { before: today },
                      ...disabledDays.map((d) => d),
                    ]}
                    numberOfMonths={1}
                  />
                </Box>

                {dateRange?.from && dateRange?.to && days > 0 && (
                  <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: "action.hover" }}>
                    <Typography variant="body2">
                      <strong>{format(dateRange.from, "dd/MM/yyyy")}</strong> → <strong>{format(dateRange.to, "dd/MM/yyyy")}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {days} nuit(s) × {property.price_per_night} € = <strong>{days * property.price_per_night} €</strong>
                    </Typography>
                  </Paper>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={bookingLoading || !dateRange?.from || !dateRange?.to || days <= 0}
                  onClick={handleBooking}
                >
                  {bookingLoading ? <CircularProgress size={22} color="inherit" /> : "Réserver"}
                </Button>

                <Box sx={{ mt: 2, justifyContent: "center", display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">Indisponible</Typography>
                </Box>
              </>
            ) : !user ? (
              <Box sx={{ textAlign: "center", py: 1 }}>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Connectez-vous pour réserver ce logement.
                </Typography>
                <Button variant="contained" component={RouterLink} to="/login" fullWidth>
                  Se connecter
                </Button>
              </Box>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: "center", py: 1 }}>
                {!property.is_available
                  ? "Ce logement n'est pas disponible actuellement."
                  : "Seuls les locataires peuvent réserver."}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
