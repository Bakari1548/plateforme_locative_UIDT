<?php

namespace App\Controllers;

use App\Models\Paiement;
use App\Models\Quittance;
use App\Models\Echeance;
use App\Models\Contrat;

class PaiementController
{
    private Paiement $paiementModel;
    private Quittance $quittanceModel;
    private Echeance $echeanceModel;
    private Contrat $contratModel;

    public function __construct()
    {
        $this->paiementModel = new Paiement();
        $this->quittanceModel = new Quittance();
        $this->echeanceModel = new Echeance();
        $this->contratModel = new Contrat();
    }

    public function record(array $data, int $enregistrePar): array
    {
        $required = ['contrat_id', 'locataire_id', 'montant'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['error' => "Le champ {$field} est requis"];
            }
        }

        $contrat = $this->contratModel->find((int)$data['contrat_id']);
        if (!$contrat) {
            return ['error' => 'Contrat non trouvé'];
        }

        $validModes = ['especes', 'cheque', 'virement', 'mobile_money'];
        $modePaiement = $data['mode_paiement'] ?? 'especes';
        if (!in_array($modePaiement, $validModes)) {
            return ['error' => 'Mode de paiement invalide'];
        }

        $referenceRecu = $this->paiementModel->generateReferenceRecu();

        $paiementData = [
            'contrat_id' => (int)$data['contrat_id'],
            'locataire_id' => (int)$data['locataire_id'],
            'echeance_id' => $data['echeance_id'] ?? null,
            'montant' => (float)$data['montant'],
            'mode_paiement' => $modePaiement,
            'enregistre_par' => $enregistrePar,
            'reference_recu' => $referenceRecu,
            'commentaire' => $data['commentaire'] ?? null
        ];

        try {
            $paiementId = $this->paiementModel->create($paiementData);

            // Mark echeance as paid if linked
            if (!empty($data['echeance_id'])) {
                $this->echeanceModel->markAsPaid((int)$data['echeance_id']);
            }

            // Generate quittance
            $periode = $data['periode'] ?? date('m/Y');
            $quittance = $this->quittanceModel->createForPaiement(
                $paiementId,
                (float)$data['montant'],
                $periode
            );

            $paiement = $this->paiementModel->getWithDetails($paiementId);

            return [
                'success' => true,
                'message' => 'Paiement enregistré avec succès',
                'paiement' => $paiement,
                'quittance' => $quittance
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function show(int $id): array
    {
        $paiement = $this->paiementModel->getWithDetails($id);
        if (!$paiement) {
            return ['error' => 'Paiement non trouvé'];
        }

        $quittance = $this->quittanceModel->findByPaiementId($id);

        return [
            'success' => true,
            'paiement' => $paiement,
            'quittance' => $quittance
        ];
    }

    public function index(int $userId, string $userRole): array
    {
        if (in_array($userRole, ['admin', 'agentRecouv', 'dcuv', 'directeur'])) {
            $paiements = $this->paiementModel->getRecent(50);
        } else {
            $paiements = $this->paiementModel->findByLocataireId($userId);
        }

        return ['success' => true, 'paiements' => $paiements, 'count' => count($paiements)];
    }

    public function getByContrat(int $contratId): array
    {
        $paiements = $this->paiementModel->findByContratId($contratId);
        return ['success' => true, 'paiements' => $paiements, 'count' => count($paiements)];
    }

    public function getMyPaiements(int $userId): array
    {
        $paiements = $this->paiementModel->findByLocataireId($userId);
        return ['success' => true, 'paiements' => $paiements, 'count' => count($paiements)];
    }

    public function recordByLocataire(array $data, int $locataireId): array
    {
        $required = ['contrat_id', 'montant'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['error' => "Le champ {$field} est requis"];
            }
        }

        $contrat = $this->contratModel->find((int)$data['contrat_id']);
        if (!$contrat) {
            return ['error' => 'Contrat non trouvé'];
        }

        if ((int)$contrat['locataire_id'] !== $locataireId) {
            return ['error' => 'Ce contrat ne vous appartient pas'];
        }

        if (!in_array($contrat['statut'], ['actif', 'signe'])) {
            return ['error' => 'Le contrat doit être actif pour effectuer un paiement'];
        }

        $validModes = ['especes', 'mobile_money'];
        $modePaiement = $data['mode_paiement'] ?? 'especes';
        if (!in_array($modePaiement, $validModes)) {
            return ['error' => 'Mode de paiement invalide (especes ou mobile_money)'];
        }

        $referenceRecu = $this->paiementModel->generateReferenceRecu();

        $paiementData = [
            'contrat_id' => (int)$data['contrat_id'],
            'locataire_id' => $locataireId,
            'echeance_id' => $data['echeance_id'] ?? null,
            'montant' => (float)$data['montant'],
            'mode_paiement' => $modePaiement,
            'enregistre_par' => $locataireId,
            'reference_recu' => $referenceRecu,
            'commentaire' => $data['commentaire'] ?? null
        ];

        try {
            $paiementId = $this->paiementModel->create($paiementData);

            if (!empty($data['echeance_id'])) {
                $this->echeanceModel->markAsPaid((int)$data['echeance_id']);
            }

            $periode = $data['periode'] ?? date('m/Y');
            $quittance = $this->quittanceModel->createForPaiement(
                $paiementId,
                (float)$data['montant'],
                $periode
            );

            $paiement = $this->paiementModel->getWithDetails($paiementId);

            return [
                'success' => true,
                'message' => 'Paiement effectué avec succès',
                'paiement' => $paiement,
                'quittance' => $quittance
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function getQuittance(int $paiementId): array
    {
        $quittance = $this->quittanceModel->findByPaiementId($paiementId);
        if (!$quittance) {
            return ['error' => 'Quittance non trouvée'];
        }

        $details = $this->quittanceModel->getWithDetails($quittance['id']);
        return ['success' => true, 'quittance' => $details];
    }

    public function getMyQuittances(int $userId): array
    {
        $quittances = $this->quittanceModel->findByLocataireId($userId);
        return ['success' => true, 'quittances' => $quittances, 'count' => count($quittances)];
    }

    public function getEcheancesByContrat(int $contratId): array
    {
        $echeances = $this->echeanceModel->findByContratId($contratId);
        return ['success' => true, 'echeances' => $echeances, 'count' => count($echeances)];
    }

    public function getOverdue(): array
    {
        // First detect overdue echeances
        $updated = $this->echeanceModel->detectOverdue();

        $overdue = $this->echeanceModel->findOverdue();
        $locataires = $this->paiementModel->getOverdueLocataires();

        return [
            'success' => true,
            'echeances_retard' => $overdue,
            'locataires_retard' => $locataires,
            'count' => count($overdue),
            'updated' => $updated
        ];
    }

    public function getStats(): array
    {
        $paiementStats = $this->paiementModel->getStats();
        $echeanceStats = $this->echeanceModel->getStats();

        $currentMonth = (int)date('m');
        $currentYear = (int)date('Y');
        $totalThisMonth = $this->paiementModel->getTotalByMonth($currentMonth, $currentYear);

        return [
            'success' => true,
            'stats' => [
                'paiements' => $paiementStats,
                'echeances' => $echeanceStats,
                'total_this_month' => $totalThisMonth
            ]
        ];
    }

    public function getByMonth(int $mois, int $annee): array
    {
        $paiements = $this->paiementModel->getByMonth($mois, $annee);
        $total = $this->paiementModel->getTotalByMonth($mois, $annee);

        return [
            'success' => true,
            'paiements' => $paiements,
            'total' => $total,
            'count' => count($paiements)
        ];
    }

    public function generateEcheances(int $contratId, array $data): array
    {
        $contrat = $this->contratModel->find($contratId);
        if (!$contrat) {
            return ['error' => 'Contrat non trouvé'];
        }

        $montant = (float)($data['montant'] ?? $contrat['montant_loyer']);
        if ($montant <= 0) {
            return ['error' => 'Montant invalide'];
        }

        $moisDebut = (int)($data['mois_debut'] ?? date('m'));
        $anneeDebut = (int)($data['annee_debut'] ?? date('Y'));
        $nbMois = (int)($data['nb_mois'] ?? 12);

        $count = 0;
        for ($i = 0; $i < $nbMois; $i++) {
            $mois = $moisDebut + $i;
            $annee = $anneeDebut;
            while ($mois > 12) {
                $mois -= 12;
                $annee++;
            }

            $this->echeanceModel->generateForContrat($contratId, $montant, $mois, $annee);
            $count++;
        }

        return [
            'success' => true,
            'message' => "{$count} échéances générées",
            'count' => $count
        ];
    }
}
