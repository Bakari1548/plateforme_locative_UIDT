# Guide de démarrage — Plateforme Locative CROUS-T

Ce guide permet à tout collaborateur d'initialiser et lancer le projet en local, de A à Z.

---

## 1. Prérequis

Vérifiez que les outils suivants sont installés sur votre machine :

| Outil | Version minimale | Vérifier avec |
|-------|-----------------|---------------|
| PHP | 8.3+ | `php -v` |
| Composer | 2.x | `composer --version` |
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| SQLite | 3 | `sqlite3 --version` |

### Extensions PHP requises

## 1. Cloner ou decompresser le projet 


Si c'est cloner depuis GitHub


```bash
git clone <url-du-repo> plateforme_locative_UIDT
cd plateforme_locative_UIDT
```

---

## 2. Configuration de l'environnement

Créez le fichier `.env` à la racine du projet à partir du modèle :

```bash
cp .env.example .env
```

Vérifiez le contenu du fichier `.env` :

```env
# Database
DB_PATH=backend/database/croust.db

# JWT
JWT_SECRET=change_this_secret_in_production_use_strong_random_string
JWT_EXPIRATION=86400

# Email (SMTP) — optionnel en développement
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your_email
SMTP_PASSWORD=your_password
SMTP_ENCRYPTION=tls
SMTP_FROM=noreply@crous-t.sn

# Application
APP_URL=http://localhost:5173
API_URL=http://localhost:8000
```

> **Note** : En développement local, la configuration SMTP n'est pas nécessaire pour faire fonctionner l'application. Laissez les valeurs par défaut.

---

## 3. Installation des dépendances

### Backend (PHP)

```bash
composer install
```

### Frontend (Node.js)

```bash
npm install
```

---

## 5. Initialisation de la base de données

### 5.1. Créer le fichier SQLite

```bash
touch backend/database/croust.db
```

### 5.2. Exécuter les migrations

```bash
composer migrate
```

Vous devriez voir :

```
=== Exécution des migrations ===
Exécution de create_utilisateurs_table.php...
✓ create_utilisateurs_table.php terminée
Exécution de create_locaux_table.php...
✓ create_locaux_table.php terminée
...
=== Toutes les migrations terminées avec succès ===
```

### 5.3. Charger les données de test (seed)

```bash
php backend/database/seed.php
```

Vous devriez voir :

```
=== Démarrage du seed de données (contexte Sénégal) ===
...
=== Seed terminé avec succès ! ===
Compte admin: admin@crous-t.sn / password123
Compte directeur: directeur@crous-t.sn / password123
Compte DCUV: dcuv1@crous-t.sn / password123
...
```

### 5.4. Créer le dossier des uploads

```bash
mkdir -p uploads/documents
```

---

## 6. Lancer l'application

Il faut lancer **deux serveurs** : le backend PHP et le frontend React.

### 6.1. Backend (port 8000)

Dans un terminal :

```bash
php -S localhost:8000 -t backend/public
```

Vous devriez voir :

```
PHP 8.x.x Development Server (http://localhost:8000) started
```

### 6.2. Frontend (port 5173)

Dans un **autre** terminal :

```bash
npm run dev
```

Vous devriez voir :

```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

### 6.3. Accéder à l'application

Ouvrez votre navigateur sur : **http://localhost:5173**

---

## 7. Comptes de test

Tous les comptes ont le mot de passe : `password123`

| Rôle | Email | Accès |
|------|-------|-------|
| Admin | `admin@crous-t.sn` | Administration système, tous droits |
| Directeur | `directeur@crous-t.sn` | Validation des demandes recevables |
| DCUV | `dcuv1@crous-t.sn` | Instruction des demandes, gestion locaux |
| Secrétaire CSA | `secretaire@crous-t.sn` | Support commission |
| Technicien | `technicien1@crous-t.sn` | Interventions techniques |
| Agent recouvrement | `recouvrement1@crous-t.sn` | Paiements, relances |
| Agent courrier | `courrier1@crous-t.sn` | Gestion courriers |
| Locataire | Voir table `utilisateurs` (role='locataire') | Demandes, paiements, incidents |

---

## 8. Architecture du projet

```
plateforme_locative_UIDT/
├── backend/                  # API PHP (port 8000)
│   ├── app/
│   │   ├── Controllers/      # Logique des contrôleurs
│   │   ├── Models/           # Modèles de données
│   │   ├── Middleware/       # Auth, rôles
│   │   └── Router.php        # Routeur personnalisé
│   ├── config/               # Config (DB, JWT, rôles, email)
│   ├── database/
│   │   ├── migrations/       # Schéma DB
│   │   ├── seed.php          # Données de test
│   │   └── croust.db         # Base SQLite (générée)
│   ├── public/index.php      # Point d'entrée API
│   └── routes/api.php        # Définition des routes
├── frontend/                 # App React (port 5173)
│   ├── src/
│   │   ├── pages/            # Pages organisées par rôle
│   │   ├── components/       # Composants réutilisables
│   │   ├── lib/api.js        # Client API
│   │   └── assets/           # Images et logo
│   └── public/
├── uploads/                  # Documents téléversés
├── .env                      # Variables d'environnement
├── composer.json             # Dépendances PHP
└── package.json              # Dépendances Node
```

---

## 9. Problèmes courants

### "Failed to resolve import" sur une image

Vérifiez que le fichier image existe bien dans `frontend/src/assets/` avec la bonne extension (`.png`, `.jpeg`, `.jpg`).

### Erreur "table not found" au démarrage

Les migrations n'ont pas été exécutées :

```bash
composer migrate
```

### Erreur 404 sur les routes API

Vérifiez que le backend tourne sur le port 8000 :

```bash
curl http://localhost:8000/api/health
```

Doit retourner : `{"status":"ok","timestamp":"...","version":"1.0.0"}`

### Les uploads ne s'affichent pas

Vérifiez que le dossier `uploads/documents/` existe :

```bash
mkdir -p uploads/documents
```

### "SQLSTATE[HY000]: General error: 1 table X has no column named Y"

La base de données est obsolète. Supprimez-la et relancez les migrations :

```bash
rm backend/database/croust.db
touch backend/database/croust.db
composer migrate
php backend/database/seed.php
```

### Conflit de port

Si le port 8000 ou 5173 est déjà utilisé, changez-le :

- Backend : `php -S localhost:8001 -t backend/public`
- Frontend : éditez `vite.config.js` → `server.port: 5174`
- Pensez à mettre à jour le proxy dans `vite.config.js` si vous changez le port backend.

---

## 10. Commandes utiles

| Action | Commande |
|--------|----------|
| Migrations | `composer migrate` |
| Seed (données test) | `php backend/database/seed.php` |
| Tests backend | `composer test` |
| Build frontend (production) | `npm run build` |
| Preview du build | `npm run preview` |
| Reset base de données | `rm backend/database/croust.db && touch backend/database/croust.db && composer migrate && php backend/database/seed.php` |

---

## 11. Flux de travail (workflow des demandes)

```
Locataire (soumet demande)
    ↓ statut: soumis
DCUV (instruit la demande)
    ↓ statut: recevable  OU  incomplet
Directeur (décide)
    ↓ statut: attribue  OU  non_attribue  OU  rejete
```

---

## 12. Bonnes pratiques

- **Ne jamais commiter** le fichier `.env` ni la base `croust.db`
- **Toujours relancer** `composer migrate` après un `git pull` (de nouvelles migrations ont pu être ajoutées)
- **Signaler** tout bug dans le canal de discussion du projet
