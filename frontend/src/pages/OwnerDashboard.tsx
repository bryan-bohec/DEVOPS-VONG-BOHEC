import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Container,
} from "@mui/material";
import {
  CheckCircleOutlined,
  CloseOutlined,
  ApartmentOutlined,
  CalendarMonthOutlined,
  PendingOutlined,
} from "@mui/icons-material";
import { getProperties, getBookings, updateBookingStatus, deleteProperty } from "../services/api";
import type { Property, Booking, User } from "../types";

type Props = Readonly<{
  user: User;
}>;

const statusColors: Record<string, "warning" | "success" | "error" | "default"> = {
  pending: "warning",
  confirmed: "success",
  cancelled: "error",
  completed: "default",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};

export default function OwnerDashboard({ user }: Props) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [msg, setMsg] = useState<{ text: string; severity: "success" | "error" } | null>(null);
  const [deleteDialogId, setDeleteDialogId] = useState<number | null>(null);
  const [refuseDialogId, setRefuseDialogId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [propRes, bookRes] = await Promise.all([
        getProperties({ owner_id: String(user.id) }),
        getBookings(),
      ]);
      setProperties(propRes.data);
      const propIds = new Set(propRes.data.map((p: Property) => p.id));
      setBookings(bookRes.data.filter((b: Booking) => propIds.has(b.property_id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (bookingId: number, status: string) => {
    try {
      await updateBookingStatus(bookingId, status);
      setMsg({ text: `Réservation ${status === "confirmed" ? "confirmée" : "refusée"}.`, severity: "success" });
      fetchData();
    } catch {
      setMsg({ text: "Erreur lors de la mise à jour.", severity: "error" });
    } finally {
      setRefuseDialogId(null);
    }
  };

  const handleDelete = async () => {
    if (deleteDialogId === null) return;
    try {
      await deleteProperty(deleteDialogId);
      setMsg({ text: "Logement supprimé.", severity: "success" });
      fetchData();
    } catch {
      setMsg({ text: "Erreur lors de la suppression.", severity: "error" });
    } finally {
      setDeleteDialogId(null);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: "center", py: 12 }}>
        <CircularProgress sx={{ color: "primary.main" }} />
      </Container>
    );
  }

  const pendingBookings = bookings.filter((b) => b.status === "pending");

  const statCards = [
    {
      icon: <ApartmentOutlined sx={{ fontSize: 28 }} />,
      value: properties.length,
      label: "Logements publiés",
      color: "#0F766E",
      bg: "rgba(15, 118, 110, 0.08)",
    },
    {
      icon: <CalendarMonthOutlined sx={{ fontSize: 28 }} />,
      value: bookings.length,
      label: "Réservations totales",
      color: "#0284C7",
      bg: "rgba(2, 132, 199, 0.08)",
    },
    {
      icon: <PendingOutlined sx={{ fontSize: 28 }} />,
      value: pendingBookings.length,
      label: "En attente",
      color: "#D97706",
      bg: "rgba(217, 119, 6, 0.08)",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Gérez vos logements et suivez vos réservations.
      </Typography>

      {msg && (
        <Alert severity={msg.severity} sx={{ mb: 3 }} onClose={() => setMsg(null)}>
          {msg.text}
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {statCards.map((s) => (
          <Grid size={{ xs: 12, sm: 4 }} key={s.label}>
            <Card sx={{ border: "1px solid", borderColor: "divider", "&:hover": { transform: "none" } }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2.5, p: 3 }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    bgcolor: s.bg,
                    color: s.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                    {s.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {s.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3, border: "1px solid", borderColor: "divider" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ px: 2 }}
        >
          <Tab label="Mes logements" />
          <Tab label={`Réservations (${bookings.length})`} />
        </Tabs>
      </Paper>

      {/* Properties Tab */}
      {tab === 0 && (
        <TableContainer component={Paper} sx={{ border: "1px solid", borderColor: "divider" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Ville</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Type</TableCell>
                <TableCell>Prix/nuit</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{p.title}</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>{p.city}</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{p.type}</TableCell>
                  <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>{p.price_per_night} €</TableCell>
                  <TableCell>
                    <Chip
                      label={p.is_available ? "Disponible" : "Indisponible"}
                      color={p.is_available ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => setDeleteDialogId(p.id)}
                      sx={{ fontSize: "0.8rem" }}
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Bookings Tab */}
      {tab === 1 && (
        <TableContainer component={Paper} sx={{ border: "1px solid", borderColor: "divider" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>ID</TableCell>
                <TableCell>Logement</TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Locataire</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Total</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{b.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>#{b.property_id}</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>#{b.tenant_id}</TableCell>
                  <TableCell sx={{ fontSize: "0.85rem" }}>
                    {new Date(b.check_in).toLocaleDateString("fr-FR")} → {new Date(b.check_out).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" }, fontVariantNumeric: "tabular-nums" }}>{b.total_price} €</TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabels[b.status]}
                      color={statusColors[b.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {b.status === "pending" && (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button
                          size="small"
                          color="success"
                          variant="contained"
                          startIcon={<CheckCircleOutlined sx={{ fontSize: 16 }} />}
                          onClick={() => handleStatusChange(b.id, "confirmed")}
                          sx={{ fontSize: "0.8rem" }}
                        >
                          Confirmer
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          startIcon={<CloseOutlined sx={{ fontSize: 16 }} />}
                          onClick={() => setRefuseDialogId(b.id)}
                          sx={{ fontSize: "0.8rem" }}
                        >
                          Refuser
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete dialog */}
      <Dialog open={deleteDialogId !== null} onClose={() => setDeleteDialogId(null)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer ce logement ? Les réservations associées pourraient être affectées.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteDialogId(null)}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refuse dialog */}
      <Dialog open={refuseDialogId !== null} onClose={() => setRefuseDialogId(null)}>
        <DialogTitle>Confirmer le refus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir refuser cette réservation ?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setRefuseDialogId(null)}>Retour</Button>
          <Button onClick={() => refuseDialogId && handleStatusChange(refuseDialogId, "cancelled")} color="error" variant="contained">
            Refuser
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
