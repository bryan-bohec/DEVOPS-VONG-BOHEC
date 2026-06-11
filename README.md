# LocaHome - Application de location de logement

Application de location de logement basée sur une architecture microservices, réalisée dans le cadre du cours d'architecture des systèmes d'informations, repris pour le completer avec le projet de DevOps

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | React 19, Vite, Material UI 9, React Router |
| Backend | Node.js, Express 5, TypeScript |
| ORM | Prisma 6 |
| Base de données | PostgreSQL 17 (une base par service) |
| Authentification | JWT (JSON Web Tokens) |
| Déploiement | Docker, Docker Compose |
| CI | GitHub Actions |
| Qualité & couverture | SonarCloud, Codecov |
| Tests | Vitest, nock, supertest |

## Architecture

```
┌──────────┐       ┌──────────────┐       ┌────────────────┐  ┌─────────────┐
│ Frontend │──────▶│ API Gateway  │──────▶│ Auth Service   │──│ postgres-   │
│ :5173    │       │ :3000        │       │ :3001          │  │ auth :5433  │
└──────────┘       └──────┬───────┘       └────────────────┘  └─────────────┘
                          │
                          ├──────────────▶┌────────────────┐  ┌─────────────┐
                          │               │ Property Svc   │──│ postgres-   │
                          │               │ :3002          │  │ property    │
                          │               └────────────────┘  │ :5434       │
                          │                                   └─────────────┘
                          │
                          └──────────────▶┌────────────────┐  ┌─────────────┐
                                          │ Booking Svc    │──│ postgres-   │
                                          │ :3003          │  │ booking     │
                                          └────────────────┘  │ :5435       │
                                                              └─────────────┘
```

Chaque service possède sa propre base de données PostgreSQL. La communication entre services se fait en HTTP synchrone via l'API Gateway.

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (inclut Docker Compose)

C'est tout. Pas besoin d'installer Node.js, PostgreSQL ou quoi que ce soit d'autre localement.

## Lancement rapide

```bash
# 1. Cloner le repo
git clone <url-du-repo>
cd DEVOPS-VONG-BOHEC

# 2. Lancer toute la stack
docker compose up --build -d

# 3. Vérifier que tout tourne
docker compose ps
```

Le premier build prend quelques minutes. Les services backend attendent automatiquement que leur base PostgreSQL soit prête (healthchecks) avant de démarrer.

## Accès

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:3000/api |
| Health check gateway | http://localhost:3000/health |

## Services

### API Gateway (port 3000)

Point d'entrée unique. Toutes les requêtes du frontend passent par `/api/*`. Le gateway route vers le bon microservice et transmet le token JWT dans les headers.

### Auth Service (port 3001)

Gestion des utilisateurs et de l'authentification JWT.

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/api/auth/register` | Non | Créer un compte (tenant ou owner) |
| POST | `/api/auth/login` | Non | Se connecter, reçoit un JWT |
| GET | `/api/auth/me` | Oui | Récupérer le profil connecté |

### Property Service (port 3002)

Gestion du catalogue de logements.

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/properties` | Non | Lister les logements (filtres : city, type, minPrice, maxPrice) |
| GET | `/api/properties/:id` | Non | Détail d'un logement |
| GET | `/api/properties/:id/availability` | Non | Vérifier la disponibilité |
| POST | `/api/properties` | Owner | Publier un logement |
| PUT | `/api/properties/:id` | Owner | Modifier un logement |
| DELETE | `/api/properties/:id` | Owner | Supprimer un logement |

### Booking Service (port 3003)

Gestion des réservations.

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/bookings` | Oui | Lister les réservations |
| GET | `/api/bookings/tenant/:tenantId` | Oui | Réservations d'un locataire |
| GET | `/api/bookings/owner/:ownerId` | Oui | Réservations pour un propriétaire |
| GET | `/api/bookings/:id` | Oui | Détail d'une réservation |
| POST | `/api/bookings` | Oui | Créer une réservation |
| PATCH | `/api/bookings/:id/status` | Oui | Changer le statut (confirmed, cancelled) |

## Structure du projet

```
.
├── docker-compose.yml          # Orchestration de tous les services
├── frontend/                   # Application React (Vite)
│   ├── Dockerfile
│   └── src/
├── backend/
│   ├── api-gateway/            # Reverse proxy + auth middleware
│   │   ├── Dockerfile
│   │   └── src/
│   ├── auth-service/           # Utilisateurs + JWT
│   │   ├── Dockerfile
│   │   ├── prisma/schema.prisma
│   │   └── src/
│   ├── property-service/       # Catalogue de logements
│   │   ├── Dockerfile
│   │   ├── prisma/schema.prisma
│   │   └── src/
│   └── booking-service/        # Réservations
│       ├── Dockerfile
│       ├── prisma/schema.prisma
│       └── src/
└── docker-data/                # Données PostgreSQL (ignoré par git)
```

## Commandes utiles

```bash
# Lancer la stack
docker compose up --build -d

# Voir les logs de tous les services
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f auth-service

# Arrêter la stack
docker compose down

# Arrêter et supprimer les données des bases
docker compose down -v
rm -rf docker-data/

# Rebuild un service après modification du code
docker compose build auth-service
docker compose up -d auth-service
```

## Personnaliser le stockage PostgreSQL (optionnel)

Par défaut, les données PostgreSQL sont stockées dans `./docker-data/` à la racine du projet.

Pour les stocker ailleurs (par exemple sur un autre disque), créez un fichier `.env` à la racine :

```env
POSTGRES_AUTH_DATA_PATH=D:/docker-data/locahome/postgres-auth
POSTGRES_PROPERTY_DATA_PATH=D:/docker-data/locahome/postgres-property
POSTGRES_BOOKING_DATA_PATH=D:/docker-data/locahome/postgres-booking
```

Un exemple est fourni dans `.env.docker.example`.

## Modèles de données

### User (auth-service)

| Champ | Type | Description |
|-------|------|-------------|
| id | Int | Clé primaire auto-incrémentée |
| email | String | Unique |
| password_hash | String | Mot de passe hashé (bcrypt) |
| first_name | String | Prénom |
| last_name | String | Nom |
| role | Enum | `tenant` ou `owner` |
| created_at | DateTime | Date de création |

### Property (property-service)

| Champ | Type | Description |
|-------|------|-------------|
| id | Int | Clé primaire auto-incrémentée |
| title | String | Titre de l'annonce |
| description | String? | Description optionnelle |
| type | String | Type de logement (appartement, maison...) |
| address | String | Adresse |
| city | String | Ville |
| price_per_night | Int | Prix par nuit (en centimes) |
| rooms | Int | Nombre de pièces |
| capacity | Int | Capacité d'accueil |
| image_url | String? | URL de l'image |
| owner_id | Int | ID du propriétaire (référence auth-service) |
| is_available | Boolean | Disponible à la location |

### Booking (booking-service)

| Champ | Type | Description |
|-------|------|-------------|
| id | Int | Clé primaire auto-incrémentée |
| property_id | Int | ID du logement (référence property-service) |
| tenant_id | Int | ID du locataire (référence auth-service) |
| check_in | DateTime | Date d'arrivée |
| check_out | DateTime | Date de départ |
| total_price | Int | Prix total (en centimes) |
| status | Enum | `pending`, `confirmed`, `cancelled`, `completed` |

## Authentification

L'application utilise des JWT (JSON Web Tokens) :

1. L'utilisateur s'inscrit ou se connecte via `/api/auth/register` ou `/api/auth/login`
2. Le serveur renvoie un `accessToken` JWT
3. Le frontend stocke ce token dans `localStorage`
4. Chaque requête authentifiée envoie le header `Authorization: Bearer <token>`
5. Le gateway vérifie le token et injecte les headers `x-user-id`, `x-user-role`, `x-user-email` vers les services en aval

## CI / Qualité

Le pipeline GitHub Actions s'exécute à chaque push et pull request sur `main` :

- **Tests & couverture** — Vitest sur les 4 services backend (tests unitaires, mocks web avec nock, tests de routes avec supertest)
- **Build Docker** — chaque service est buildé en image Docker
- **SonarCloud** — analyse statique de la qualité du code
- **Codecov** — rapport de couverture de code

Pour lancer les tests localement sur un service :

```bash
cd backend/auth-service   # ou api-gateway, property-service, booking-service
npm ci
npm run test:coverage
```

## Auteurs

VONG, BOHEC
