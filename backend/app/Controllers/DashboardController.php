<?php

namespace App\Controllers;

use App\Models\Demande;
use App\Models\Contrat;
use App\Models\Local;
use App\Models\Paiement;
use App\Models\Incident;
use App\Models\ControleQHSE;
use App\Models\Sanction;
use App\Models\Notification;
use App\Models\Intervention;

class DashboardController
{
    private Demande $demandeModel;
    private Contrat $contratModel;
    private Local $localModel;
    private Paiement $paiementModel;
    private Incident $incidentModel;
    private ControleQHSE $controleModel;
    private Sanction $sanctionModel;
    private Notification $notificationModel;
    private Intervention $interventionModel;

    public function __construct()
    {
        $this->demandeModel = new Demande();
        $this->contratModel = new Contrat();
        $this->localModel = new Local();
        $this->paiementModel = new Paiement();
        $this->incidentModel = new Incident();
        $this->controleModel = new ControleQHSE();
        $this->sanctionModel = new Sanction();
        $this->notificationModel = new Notification();
        $this->interventionModel = new Intervention();
    }

    public function getGlobal(): array
    {
        $demandeStats = $this->demandeModel->getStats();
        $contratStats = $this->contratModel->getStats();
        $localStats = $this->localModel->getStats();
        $paiementStats = $this->paiementModel->getStats();
        $incidentStats = $this->incidentModel->getStats();
        $controleStats = $this->controleModel->getStats();
        $sanctionStats = $this->sanctionModel->getStats();

        $currentMonth = (int)date('m');
        $currentYear = (int)date('Y');
        $totalThisMonth = $this->paiementModel->getTotalByMonth($currentMonth, $currentYear);
        $paiementEvolution = $this->paiementModel->getMonthlyEvolution(6);
        $interventionStats = $this->interventionModel->getStats();

        // Compteurs réels pour cartes Directeur
        $contratsSignes = 0;
        $contratsEnAttente = 0;
        if (is_array($contratStats)) {
            foreach ($contratStats as $row) {
                if (in_array($row['statut'], ['signe', 'actif'])) $contratsSignes += (int)$row['count'];
                if (in_array($row['statut'], ['en_attente_signature', 'en_validation_directeur'])) $contratsEnAttente += (int)$row['count'];
            }
        }
        $decisionsPrises = 0;
        $decisionsEnAttente = 0;
        if (is_array($demandeStats)) {
            foreach ($demandeStats as $row) {
                if (in_array($row['statut'], ['attribue', 'non_attribue', 'rejete'])) $decisionsPrises += (int)$row['count'];
                if (in_array($row['statut'], ['en_commission', 'en_instruction', 'recevable'])) $decisionsEnAttente += (int)$row['count'];
            }
        }

        return [
            'success' => true,
            'dashboard' => [
                'demandes' => $demandeStats,
                'contrats' => $contratStats,
                'locaux' => $localStats,
                'paiements' => $paiementStats,
                'incidents' => $incidentStats,
                'controles_qhse' => $controleStats,
                'sanctions' => $sanctionStats,
                'total_recettes_mois' => $totalThisMonth,
                'paiement_evolution' => $paiementEvolution,
                'interventions' => $interventionStats,
                'decisions_prises' => $decisionsPrises,
                'decisions_en_attente' => $decisionsEnAttente,
                'contrats_signes' => $contratsSignes,
                'contrats_en_attente' => $contratsEnAttente
            ]
        ];
    }

    public function getForRole(int $userId, string $userRole): array
    {
        $data = [];

        switch ($userRole) {
            case 'admin':
            case 'directeur':
                return $this->getGlobal();

            case 'dcuv':
                $data['demandes'] = $this->demandeModel->getStats();
                $data['contrats'] = $this->contratModel->getStats();
                $data['locaux'] = $this->localModel->getStats();
                $data['incidents'] = $this->incidentModel->getStats();
                $data['controles_qhse'] = $this->controleModel->getStats();
                $data['pending_demandes'] = count($this->demandeModel->getPendingInstruction());
                $data['pending_contrats'] = count($this->contratModel->getPendingSignature());

                // 4 cartes avec nombres réels
                $demandeStats = $this->demandeModel->getStats();
                $data['total_demandes'] = is_array($demandeStats) ? array_sum(array_map(fn($r) => (int)$r['count'], $demandeStats)) : 0;

                $contratStats = $this->contratModel->getStats();
                $data['contrats_signes'] = 0;
                if (is_array($contratStats)) {
                    foreach ($contratStats as $row) {
                        if (in_array($row['statut'], ['signe', 'actif'])) $data['contrats_signes'] += (int)$row['count'];
                    }
                }

                $controleStats = $this->controleModel->getStats();
                $data['total_controles_qhse'] = (int)($controleStats['total'] ?? 0);

                $interventionStats = $this->interventionModel->getStats();
                $data['interventions_terminees'] = (int)($interventionStats['terminees'] ?? 0);
                break;

            case 'secretaireCSA':
                $data['demandes'] = $this->demandeModel->getStats();
                $data['pending_demandes'] = count($this->demandeModel->getPendingInstruction());
                break;

            case 'agentRecouv':
                $data['paiements'] = $this->paiementModel->getStats();
                $data['echeances'] = $this->paiementModel->getOverdueLocataires();
                $currentMonth = (int)date('m');
                $currentYear = (int)date('Y');
                $data['total_this_month'] = $this->paiementModel->getTotalByMonth($currentMonth, $currentYear);
                break;

            case 'technicien':
                $data['incidents'] = $this->incidentModel->findByTechnicienId($userId);
                $data['pending_count'] = count($this->incidentModel->getPending());
                break;

            case 'locataire':
                $data['demandes'] = $this->demandeModel->findByUserId($userId);
                $data['contrats'] = $this->contratModel->findByLocataireId($userId);
                $data['paiements'] = $this->paiementModel->findByLocataireId($userId);
                $data['incidents'] = $this->incidentModel->findByLocataireId($userId);
                $data['sanctions'] = $this->sanctionModel->findByLocataireId($userId);
                break;

            default:
                $data['message'] = 'Tableau de bord non disponible pour ce rôle';
        }

        $data['notifications_unread'] = $this->notificationModel->countUnread($userId);

        return ['success' => true, 'dashboard' => $data];
    }
}
