# Plateforme de Gestion de l'Occupation du Site VCN

Plateforme de gestion locative du CROUS-T pour la gestion complète des demandes d'occupation, contrats, paiements, incidents et contrôles QHSE.

## 📋 Table des matières

- [Architecture](#architecture)
- [Stack Technique](#stack-technique)
- [Installation](#installation)
- [Structure du Projet](#structure-du-projet)
- [Configuration](#configuration)
- [Développement](#développement)
- [Tests](#tests)

## 🏗️ Architecture

L'application suit une architecture MVC personnalisée avec une séparation claire entre backend et frontend :

```
plateforme_locative_UIDT/
├── backend/                 # API PHP 8.3
│   ├── app/
│   │   ├── Controllers/    # Contrôleurs API
│   │   ├── Models/         # Modèles de données
│   │   ├── Middleware/     # Middleware (auth, rôles, CSRF)
│   │   ├── Services/       # Services métiers
│   │   └── Views/          # Vues (si nécessaire)
│   ├── config/             # Configuration
│   ├── database/           # Migrations et seeds
│   ├── public/             # Point d'entrée public
│   └── templates/          # Templates emails
├── frontend/               # Application React
│   ├── src/
│   │   ├── pages/          # Pages par rôle
│   │   ├── components/    # Composants réutilisables
│   │   └── lib/            # Utilitaires et API
│   └── public/             # Assets statiques
├── docs/                   # Documentation
└── tests/                  # Tests
```

## 🛠️ Stack Technique

### Backend
- **PHP 8.3** - Langage principal
- **SQLite** - Base de données
- **Architecture MVC** - Structure personnalisée
- **JWT (firebase/php-jwt)** - Authentification
- **Cloudinary** - Stockage documents
- **PHPMailer** - Envoi emails

### Frontend
- **React 18** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - Client HTTP
- **Lucide React** - Icônes

### Authentification & Autorisation
- **JWT** - Tokens d'authentification
- **RBAC** - Contrôle d'accès basé sur les rôles (9 rôles)
- **Matrice RACI** - Alignement permissions

## 📦 Installation

### Prérequis

- PHP 8.3 ou supérieur
- Composer
- Node.js 18+ et npm
- Extension PDO PHP
- Extension JSON PHP
- Extension MBString PHP

### Installation Backend

```bash
# Installer les dépendances PHP
composer install

# Créer la base de données SQLite
touch backend/database/croust.db

# Exécuter les migrations
composer migrate
```

### Installation Frontend

```bash
# Installer les dépendances Node
npm install

# Démarrer le serveur de développement
npm run dev
```

## ⚙️ Configuration

### Variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
# Database
DB_PATH=backend/database/croust.db

# JWT
JWT_SECRET=votre_secret_jwt_ici
JWT_EXPIRATION=86400

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=votre_email
SMTP_PASSWORD=votre_password
SMTP_ENCRYPTION=tls
SMTP_FROM=noreply@croust.tg

# Application
APP_URL=http://localhost:5173
API_URL=http://localhost:8000
```

### Configuration Backend

Les fichiers de configuration se trouvent dans `backend/config/` :
- `database.php` - Configuration base de données
- `jwt.php` - Configuration JWT
- `roles.php` - Définition des rôles et permissions RACI
- `email.php` - Configuration SMTP
- `cloudinary.php` - Configuration Cloudinary

### Configuration Frontend

Créer `frontend/src/lib/config.js` :

```javascript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
```

## 🚀 Développement

### Démarrer le Backend

```bash
# Serveur PHP intégré
php -S localhost:8000 -t backend/public
```

### Démarrer le Frontend

```bash
# Serveur de développement Vite
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Créer une nouvelle migration

```bash
# Créer un fichier de migration dans backend/database/migrations/
# Nom : create_table_name.php
```

Exemple de structure de migration :

```php
<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = Database::getInstance();
    $sql = "CREATE TABLE IF NOT EXISTS table_name (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        column_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )";
    $db->exec($sql);
    echo "Migration table_name exécutée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration: " . $e->getMessage() . "\n";
}
```

## 🧪 Tests

### Tests Backend (PHPUnit)

```bash
# Exécuter tous les tests
composer test

# Exécuter un test spécifique
vendor/bin/phpunit tests/Feature/AuthTest.php
```

### Tests Frontend

Les tests E2E seront ajoutés avec Playwright dans une phase ultérieure.

## 👥 Rôles et Permissions

L'application implémente 9 rôles alignés sur la matrice RACI :

1. **visiteur** - Accès public uniquement
2. **locataire** - Gestion de ses demandes, paiements, incidents
3. **dcuv** - Instruction demandes, gestion locaux, contrôles QHSE
4. **directeur** - Validation décisions, signature contrats
5. **technicien** - Interventions techniques
6. **agentRecouv** - Enregistrement paiements, relances
7. **agentCourrier** - Gestion courriers
8. **secretaireCSA** - Support commission
9. **admin** - Administration système

Les permissions détaillées sont définies dans `backend/config/roles.php`

## 📊 Modules Principaux

1. **Authentification** - Inscription, connexion, JWT
2. **Demandes** - Dépôt, instruction, commission
3. **Contrats** - Génération, signature, suivi
4. **Locaux** - Référentiel, disponibilité, transferts
5. **Paiements** - Enregistrement, quittances, relances
6. **Incidents** - Signalement, interventions, traçabilité
7. **QHSE** - Contrôles, scores, sanctions
8. **Notifications** - Emails transversaux
9. **Tableaux de bord** - Statistiques, exports
10. **Vitrine publique** - Informations, procédures

## 📝 Conventions de Code

### Backend PHP
- PSR-4 autoloading
- CamelCase pour les classes
- snake_case pour les méthodes et variables
- Commentaires PHPDoc

### Frontend React
- Functional components avec hooks
- PascalCase pour les composants
- camelCase pour les fonctions et variables
- Components dans `src/components/`
- Pages dans `src/pages/`

## 🔒 Sécurité

- JWT pour l'authentification
- Middleware d'autorisation par rôle
- Validation des inputs
- Protection CSRF (à implémenter)
- Rate limiting (à implémenter)
- Chiffrement données sensibles (à implémenter)

## 📚 Documentation

La documentation détaillée se trouve dans le dossier `docs/` :
- `architecture.md` - Diagrammes architecture
- `api.md` - Documentation API
- `database.md` - Schéma base de données
- `installation.md` - Guide installation détaillé
- `administration.md` - Guide administration
- `utilisateur.md` - Guide utilisateur

## 🤝 Contribution

Ce projet est développé dans le cadre du cours de Base de Données Avancée - UIDT.

## 📄 Licence

Projet académique - CROUS-T

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2025
