import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Button, Card, CardContent, Grid, Container, Stack } from "@mui/material";
import { SearchRounded, CalendarMonthRounded, SpaceDashboardRounded, ArrowForward } from "@mui/icons-material";
import type { User } from "../types";

interface Props {
  user: User | null;
}

export default function HomePage({ user }: Props) {
  return (
    <Box>
      {/* Hero */}
      <Box sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 14 }, textAlign: "center" }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: "2.5rem", sm: "3.2rem", md: "4rem" },
              color: "text.primary",
              mb: 2.5,
              maxWidth: 720,
              mx: "auto",
              lineHeight: 1.1,
            }}
          >
            Trouvez le logement{" "}
            <Box
              component="span"
              sx={{
                color: "primary.main",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 4,
                  left: 0,
                  width: "100%",
                  height: 6,
                  bgcolor: "primary.light",
                  opacity: 0.25,
                  borderRadius: 2,
                },
              }}
            >
              de vos rêves
            </Box>
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              color: "text.secondary",
              fontWeight: 400,
              mb: 5,
              maxWidth: 520,
              mx: "auto",
              fontSize: { xs: "1rem", md: "1.15rem" },
              lineHeight: 1.6,
            }}
          >
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              width: "fit-content",
              mx: "auto",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/properties"
              endIcon={<ArrowForward />}
              sx={{ px: 4, py: 1.5 }}
            >
              Voir les logements
            </Button>
            {!user && (
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to="/register"
                sx={{ px: 4, py: 1.5 }}
              >
                Créer un compte
              </Button>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{ textAlign: "center", mb: 1.5 }}
        >
          Comment ça marche
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ textAlign: "center", mb: 6, maxWidth: 480, mx: "auto" }}
        >
          Une plateforme simple pour les locataires et les propriétaires.
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              icon: <SearchRounded sx={{ fontSize: 32 }} />,
              step: "01",
              title: "Recherchez",
              desc: "Filtrez par type, ville, budget et capacité pour trouver le logement qui vous correspond.",
            },
            {
              icon: <CalendarMonthRounded sx={{ fontSize: 32 }} />,
              step: "02",
              title: "Réservez",
              desc: "Choisissez vos dates et réservez directement en ligne. Suivi en temps réel de vos demandes.",
            },
            {
              icon: <SpaceDashboardRounded sx={{ fontSize: 32 }} />,
              step: "03",
              title: "Gérez",
              desc: "Propriétaires : publiez vos annonces et gérez les réservations depuis votre dashboard.",
            },
          ].map((f) => (
            <Grid size={{ xs: 12, md: 4 }} key={f.step}>
              <Card
                sx={{
                  height: "100%",
                  border: "none",
                  bgcolor: "transparent",
                  boxShadow: "none",
                  "&:hover": { boxShadow: "none", transform: "none" },
                }}
              >
                <CardContent sx={{ px: { xs: 2, md: 3 } }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      bgcolor: "rgba(15, 118, 110, 0.08)",
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2.5,
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.08em", mb: 0.5, display: "block" }}
                  >
                    ÉTAPE {f.step}
                  </Typography>
                  <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                    {f.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {f.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: "primary.main", color: "white" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ mb: 2, fontFamily: "'Outfit', sans-serif" }}
          >
            Vous êtes propriétaire ?
          </Typography>
          <Typography sx={{ mb: 4, opacity: 0.9, maxWidth: 460, mx: "auto" }}>
            Publiez votre logement gratuitement et commencez à recevoir des réservations.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/register"
            sx={{
              bgcolor: "white",
              color: "primary.main",
              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
              px: 4,
            }}
          >
            Commencer maintenant
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
