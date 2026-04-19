# Infomac Bot v2.0

Bot chatbot pour infomac.fr — déployé sur Railway.

## Variables d'environnement (Railway)

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL PostgreSQL (fournie automatiquement par Railway) |
| `ADMIN_TOKEN` | Token secret pour accéder aux routes admin |
| `PORT` | Port (fourni automatiquement par Railway) |

## Routes

| Route | Méthode | Description |
|---|---|---|
| `/health` | GET | Vérification que le bot tourne |
| `/chat` | POST | Envoyer un message au bot |
| `/admin/leads` | GET | Voir les leads (token requis) |
| `/admin/stats` | GET | Statistiques (token requis) |

## Déploiement Railway

1. Connecte ce dépôt GitHub à Railway
2. Ajoute une base PostgreSQL dans Railway
3. Configure les variables d'environnement
4. C'est tout !
