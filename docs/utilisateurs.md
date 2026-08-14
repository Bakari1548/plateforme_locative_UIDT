# Rôles et utilisateurs de la plateforme

Ce document décrit les différents profils d'utilisateurs de la plateforme de gestion locative du site VCN, leurs responsabilités, permissions et les principaux endpoints API auxquels ils ont accès.

Les rôles sont définis dans `backend/config/Roles.php` et vérifiés à l'exécution via `App\Middleware\RoleMiddleware` (contrôle de rôle) et `App\Middleware\AuthMiddleware` (authentification JWT).

## Vue d'ensemble des rôles

| Constante (`Roles::`) | Valeur en base | Description courte |
|---|---|---|
| `VISITEUR` | `visiteur` | Utilisateur non authentifié / grand public |
| `LOCATAIRE` | `locataire` | Occupant d'un local (commerçant, restaurateur, etc.) |
| `DCUV` | `dcuv` | Agent de la Division Chargée de l'Utilisation et de la Valorisation |
| `DIRECTEUR` | `directeur` | Directeur du COUD, valide les décisions finales |
| `TECHNICIEN` | `technicien` | Agent de maintenance technique |
| `AGENT_RECOUV` | `agentRecouv` | Agent de recouvrement (paiements, quittances) |
| `AGENT_COURRIER` | `agentCourrier` | Agent chargé de la gestion du courrier administratif |
| `SECRETAIRE_CSA` | `secretaireCSA` | Secrétaire de la Commission Sociale d'Attribution |
| `ADMIN` | `admin` | Administrateur système, gestion globale de la plateforme |

---

## 1. Visiteur (`visiteur`)

**Rôle par défaut** attribué à toute personne non authentifiée ou nouvellement inscrite sans affectation particulière.

**Peut faire :**
- Créer une demande de local (`demandes.create`)
- Consulter les informations publiques (`public.view`)

**Ne peut pas :** consulter ses propres demandes après création (doit s'authentifier), signer un contrat, effectuer un paiement.

---

## 2. Locataire (`locataire`)

**Occupant d'un local** (cantine, boutique, kiosque, bureau) sur le site VCN. C'est le rôle attribué par défaut lors de l'inscription (`POST /api/auth/register`).

**Permissions (`Roles::LOCATAIRE`) :**
- `demandes.create`, `demandes.view_own` — créer et suivre ses propres demandes
- `contrats.view_own`, `contrats.sign` — consulter et signer son contrat de location
- `paiements.view_own` — consulter l'historique de ses paiements
- `incidents.create`, `incidents.view_own` — signaler un incident et suivre son traitement
- `scores.view_own` — consulter ses scores QHSE

**Principaux endpoints :**
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/demandes` | Soumettre une demande de local |
| GET | `/api/demandes/my` | Lister ses propres demandes |
| POST | `/api/demandes/{id}/submit` | Finaliser la soumission d'une demande |
| GET | `/api/contrats/my` | Consulter ses contrats |
| POST | `/api/contrats/{id}/sign/locataire` | Signer son contrat |
| GET | `/api/paiements/my` | Historique de ses paiements |
| GET | `/api/quittances/my` | Ses quittances de loyer |
| GET | `/api/echeances/contrat/{contratId}` | Échéances de son contrat |
| POST | `/api/incidents` | Signaler un incident dans son local |
| GET | `/api/incidents` | Suivre ses incidents signalés |
| GET | `/api/sanctions` | Consulter les sanctions le concernant |
| GET | `/api/notifications` | Ses notifications |
| GET | `/api/dashboard` | Tableau de bord personnalisé locataire |

---

## 3. DCUV (`dcuv`)

**Division Chargée de l'Utilisation et de la Valorisation.** Rôle pivot de l'instruction administrative : traite les demandes, gère les locaux et contrats, valide les incidents et applique les sanctions QHSE.

**Permissions (`Roles::DCUV`) :**
- `demandes.view_all`, `demandes.instruct`, `demandes.request_complements`
- `contrats.view_all`, `contrats.manage`
- `locaux.manage`, `locaux.view`
- `incidents.view_all`, `incidents.validate`
- `controles_qhse.create`, `controles_qhse.view`
- `sanctions.create`, `sanctions.view`

**Principaux endpoints :**
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/demandes/pending` | Demandes en attente d'instruction |
| PATCH | `/api/demandes/{id}/statut` | Changer le statut d'une demande |
| GET | `/api/demandes/stats` | Statistiques des demandes |
| POST / GET / PATCH | `/api/commissions...` | Créer, consulter, gérer les commissions |
| GET / POST / PUT | `/api/contrats`, `/api/contrats/{id}` | Gérer les contrats |
| POST | `/api/contrats/{id}/sign/dcuv` | Contre-signer un contrat |
| POST / GET / PUT / DELETE | `/api/locaux...` | Gestion complète des locaux |
| POST / PATCH | `/api/transferts...` | Gérer les transferts de locaux |
| PATCH | `/api/incidents/{id}/validate` | Valider un incident signalé |
| PATCH | `/api/incidents/{id}/assign` | Assigner un technicien |
| POST / GET / PATCH | `/api/controles-qhse...` | Contrôles qualité/hygiène/sécurité/environnement |
| POST / PATCH | `/api/sanctions...` | Créer/lever une sanction |
| GET | `/api/dashboard` | Tableau de bord DCUV |

---

## 4. Directeur (`directeur`)

**Valide les décisions finales** d'attribution ou de rejet des demandes après avis de la commission, et supervise les indicateurs globaux.

**Permissions (`Roles::DIRECTEUR`) :**
- `decisions.validate`, `decisions.view`
- `contrats.approve`
- `dashboard.view_global`
- `users.manage`

**Principaux endpoints :**
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/commissions`, `/api/commissions/avis`, `/api/commissions/{id}` | Consulter les commissions et avis |
| POST | `/api/contrats/{id}/resilier` | Résilier un contrat |
| GET | `/api/contrats/active`, `/api/contrats/stats` | Vue globale des contrats |
| GET | `/api/dashboard/global` | Tableau de bord global (avec Admin) |

> Note : les décisions elles-mêmes sont enregistrées via le modèle `Decision` (table `decisions`), typiquement suite à l'avis d'une commission (`avis` = `favorable`/`defavorable`).

---

## 5. Technicien (`technicien`)

**Agent de maintenance** chargé du diagnostic et de la réparation des incidents signalés dans les locaux.

**Permissions (`Roles::TECHNICIEN`) :**
- `incidents.view_assigned`
- `interventions.create`, `interventions.update`

**Principaux endpoints :**
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/incidents/pending` | Incidents en attente (avec Admin, DCUV) |
| PATCH | `/api/incidents/{id}/statut` | Mettre à jour le statut d'un incident |
| GET | `/api/interventions/my` | Ses interventions assignées |
| GET | `/api/interventions/incident/{incidentId}` | Interventions liées à un incident |
| POST | `/api/interventions` | Créer une intervention |
| PATCH | `/api/interventions/{id}/complete` | Clôturer une intervention |

---

## 6. Agent de recouvrement (`agentRecouv`)

**Gère l'encaissement des loyers**, l'émission des quittances et le suivi des impayés.

**Permissions (`Roles::AGENT_RECOUV`) :**
- `paiements.record`, `paiements.view_all`
- `quittances.generate`
- `relances.send`
- `dashboard.view_recouvrement`

**Principaux endpoints :**
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/paiements` | Enregistrer un paiement de loyer |
| GET | `/api/paiements/stats` | Statistiques de recouvrement (avec Admin, DCUV, Directeur) |
| GET | `/api/paiements/overdue` | Loyers impayés / en retard |
| GET | `/api/paiements/month/{mois}/{annee}` | Paiements d'un mois donné |
| POST | `/api/echeances/generate/{contratId}` | Générer les échéances d'un contrat |

---

## 7. Agent courrier (`agentCourrier`)

**Gère la correspondance administrative** entre l'administration et les locataires (notifications, relances, invitations).

**Permissions (`Roles::AGENT_COURRIER`) :**
- `courriers.manage`, `courriers.view`

**Principaux endpoints :**
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/courriers` | Créer un courrier (avec Admin, DCUV, Secrétaire CSA) |
| PATCH | `/api/courriers/{id}/send` | Envoyer un courrier |
| GET | `/api/courriers/sent`, `/api/courriers/received` | Courriers envoyés / reçus |

---

## 8. Secrétaire CSA (`secretaireCSA`)

**Secrétaire de la Commission Sociale d'Attribution.** Organise les commissions d'examen des demandes et enregistre les avis rendus.

**Permissions (`Roles::SECRETAIRE_CSA`) :**
- `commissions.view`, `commissions.manage`

**Principaux endpoints :**
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/commissions` | Planifier une commission |
| PATCH | `/api/commissions/{id}/avis` | Enregistrer l'avis de la commission |
| PATCH | `/api/commissions/{id}/statut` | Changer le statut de la commission |
| POST / DELETE | `/api/commissions/{id}/membres...` | Gérer les membres de la commission |
| POST | `/api/courriers` | Émettre des courriers liés aux commissions (invitation, décision) |

---

## 9. Administrateur (`admin`)

**Accès complet à la plateforme.** Gère les comptes utilisateurs et supervise l'ensemble du système. L'admin cumule implicitement l'accès à quasiment toutes les routes protégées par `RoleMiddleware` (il est systématiquement inclus dans la liste des rôles autorisés).

**Permissions (`Roles::ADMIN`) :**
- `users.manage`, `users.view_all`
- `config.manage`
- `imports.execute`
- `notifications.manage`
- `dashboard.view_global`

**Principaux endpoints (exclusifs Admin) :**
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/users` | Lister tous les utilisateurs |
| GET | `/api/users/{id}` | Détail d'un utilisateur |
| PUT | `/api/users/{id}` | Modifier un utilisateur |
| DELETE | `/api/users/{id}` | Supprimer un utilisateur |
| PATCH | `/api/users/{id}/status` | Activer/suspendre un compte |
| PATCH | `/api/users/{id}/role` | Changer le rôle d'un utilisateur |
| GET | `/api/users/search/{query}` | Rechercher un utilisateur |
| GET | `/api/users/role/{role}` | Lister les utilisateurs par rôle |
| POST | `/api/notifications` | Créer une notification (avec DCUV) |

---

## Matrice récapitulative des permissions

| Module | Visiteur | Locataire | DCUV | Directeur | Technicien | Agent Recouv. | Agent Courrier | Secrétaire CSA | Admin |
|---|---|---|---|---|---|---|---|---|---|
| Demandes (créer/suivre) | ✅ | ✅ | — | — | — | — | — | — | — |
| Demandes (instruire/décider) | — | — | ✅ | — | — | — | — | — | — |
| Commissions | — | — | ✅ | Consultation | — | — | — | ✅ | — |
| Décisions finales | — | — | — | ✅ | — | — | — | — | — |
| Contrats (gérer) | — | Signer | ✅ | Approuver/Résilier | — | — | — | — | — |
| Locaux | — | — | ✅ | — | — | — | — | — | — |
| Paiements / Quittances | — | Consulter | — | Consulter stats | — | ✅ | — | — | — |
| Incidents (signaler) | — | ✅ | — | — | — | — | — | — | — |
| Incidents (valider/assigner) | — | — | ✅ | — | — | — | — | — | — |
| Interventions | — | — | — | — | ✅ | — | — | — | — |
| Contrôles QHSE / Sanctions | — | Consulter | ✅ | — | — | — | — | — | — |
| Courriers | — | Consulter | ✅ | — | — | — | ✅ | ✅ | — |
| Notifications | — | Consulter | Créer | — | — | — | — | — | Créer/gérer |
| Gestion des utilisateurs | — | — | — | — | — | — | — | — | ✅ |
| Dashboard global | — | — | — | ✅ | — | — | — | — | ✅ |

*(✅ = accès principal ; les rôles `Admin` et parfois `DCUV`/`Directeur` sont souvent inclus en complément dans les contrôles d'accès du code, voir `backend/routes/api.php` pour le détail exact de chaque route.)*

---

## Comptes de démonstration (données de seed)

Le script `backend/database/seed.php` génère des comptes de test avec le mot de passe `password123` :

| Rôle | Email |
|---|---|
| Admin | `admin@crous-t.sn` |
| Directeur | `directeur@crous-t.sn` |
| DCUV | `dcuv1@crous-t.sn`, `dcuv2@crous-t.sn`, `dcuv3@crous-t.sn` |
| Secrétaire CSA | `secretaire@crous-t.sn` |
| Technicien | `technicien1@crous-t.sn`, `technicien2@crous-t.sn`, `technicien3@crous-t.sn` |
| Agent de recouvrement | `recouvrement1@crous-t.sn`, `recouvrement2@crous-t.sn` |
| Agent courrier | `courrier1@crous-t.sn`, `courrier2@crous-t.sn` |
| Locataires | comptes générés dynamiquement (voir table `utilisateurs`, `role = 'locataire'`) |

## Références

- Définition des rôles et permissions : `backend/config/Roles.php`
- Contrôle d'accès par rôle : `backend/app/Middleware/RoleMiddleware.php`
- Authentification JWT : `backend/app/Middleware/AuthMiddleware.php`
- Déclaration complète des routes : `backend/routes/api.php`
