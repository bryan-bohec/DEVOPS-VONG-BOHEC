import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Container,
} from "@mui/material";
import { CalendarMonthOutlined } from "@mui/icons-material";
import { getBookings, updateBookingStatus } from "../services/api";
import type { Booking, User } from "../types";

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

export default function MyBookingsPage({ user }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; severity: "success" | "error" } | null>(null);
  const [cancelDialogId, setCancelDialogId] = useState<number | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await getBookings({ tenant_id: String(user.id) });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async () => {
    if (cancelDialogId === null) return;
    try {
      await updateBookingStatus(cancelDialogId, "cancelled");
      setMsg({ text: "Réservation annulée avec succès.", severity: "success" });
      fetchBookings();
    } catch {
      setMsg({ text: "Erreur lors de l'annulation.", severity: "error" });
    } finally {
      setCancelDialogId(null);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: "center", py: 12 }}>
        <CircularProgress sx={{ color: "primary.main" }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
        Mes réservations
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Retrouvez l'historique et le statut de vos réservations.
      </Typography>

      {msg && (
        <Alert severity={msg.severity} sx={{ mb: 3 }} onClose={() => setMsg(null)}>
          {msg.text}
        </Alert>
      )}

      {bookings.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <CalendarMonthOutlined sx={{ fontSize: 56, color: "divider", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Aucune réservation
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Vous n'avez pas encore de réservation. Parcourez les logements disponibles.
          </Typography>
          <Button variant="contained" component={RouterLink} to="/properties">
            Voir les logements
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ border: "1px solid", borderColor: "divider" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>ID</TableCell>
                <TableCell>Logement</TableCell>
                <TableCell>Arrivée</TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Départ</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{b.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>#{b.property_id}</TableCell>
                  <TableCell>{new Date(b.check_in).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>{new Date(b.check_out).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{b.total_price} €</TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabels[b.status]}
                      color={statusColors[b.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {b.status === "pending" && (
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => setCancelDialogId(b.id)}
                        sx={{ fontSize: "0.8rem" }}
                      >
                        Annuler
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={cancelDialogId !== null} onClose={() => setCancelDialogId(null)}>
        <DialogTitle>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setCancelDialogId(null)}>Retour</Button>
          <Button onClick={handleCancel} color="error" variant="contained">
            Annuler la réservation
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
