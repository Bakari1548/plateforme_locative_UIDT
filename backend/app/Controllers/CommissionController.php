<?php

namespace App\Controllers;

use App\Models\Commission;
use App\Models\Demande;
use App\Models\Decision;

class CommissionController
{
    private Commission $commissionModel;
    private Demande $demandeModel;
    private Decision $decisionModel;

    public function __construct()
    {
        $this->commissionModel = new Commission();
        $this->demandeModel = new Demande();
        $this->decisionModel = new Decision();
    }

    public function createForDemande(int $demandeId, array $data): array
    {
        $demande = $this->demandeModel->find($demandeId);
        if (!$demande) {
            return ['error' => 'Demande non trouvée'];
        }

        if ($demande['statut'] !== 'en_commission') {
            return ['error' => 'La demande doit être en statut "en_commission"'];
        }

        $commissionData = [
            'demande_id' => $demandeId,
            'date_commission' => $data['date_commission'] ?? date('Y-m-d H:i:s'),
            'lieu' => $data['lieu'] ?? null,
            'statut' => 'planifiee'
        ];

        try {
            $commissionId = $this->commissionModel->create($commissionData);
            
            // Add members if provided
            if (!empty($data['membres'])) {
                foreach ($data['membres'] as $membreId) {
                    $this->commissionModel->addMembre($commissionId, (int)$membreId);
                }
            }

            $commission = $this->commissionModel->getWithMembres($commissionId);
            
            return [
                'success' => true,
                'message' => 'Commission créée avec succès',
                'commission' => $commission
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la création: ' . $e->getMessage()];
        }
    }

    public function show(int $id): array
    {
        $commission = $this->commissionModel->getWithMembres($id);
        if (!$commission) {
            return ['error' => 'Commission non trouvée'];
        }
        return ['success' => true, 'commission' => $commission];
    }

    public function getPending(): array
    {
        $commissions = $this->commissionModel->getPending();
        return ['success' => true, 'commissions' => $commissions, 'count' => count($commissions)];
    }

    public function getWithAvis(): array
    {
        $commissions = $this->commissionModel->getWithAvis();
        return ['success' => true, 'commissions' => $commissions, 'count' => count($commissions)];
    }

    public function emitAvis(int $id, array $data): array
    {
        $commission = $this->commissionModel->find($id);
        if (!$commission) {
            return ['error' => 'Commission non trouvée'];
        }

        if (empty($data['avis']) || empty($data['avis_motive'])) {
            return ['error' => 'Avis et avis motivé sont requis'];
        }

        $validAvis = ['favorable', 'defavorable', 'reserve'];
        if (!in_array($data['avis'], $validAvis)) {
            return ['error' => 'Avis invalide'];
        }

        try {
            $this->commissionModel->updateAvis($id, $data['avis'], $data['avis_motive'], $data['recommandation'] ?? null);
            $updated = $this->commissionModel->getWithMembres($id);
            
            return [
                'success' => true,
                'message' => 'Avis émis avec succès',
                'commission' => $updated
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function addMembre(int $commissionId, int $userId): array
    {
        try {
            $this->commissionModel->addMembre($commissionId, $userId);
            return ['success' => true, 'message' => 'Membre ajouté'];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function removeMembre(int $commissionId, int $userId): array
    {
        try {
            $this->commissionModel->removeMembre($commissionId, $userId);
            return ['success' => true, 'message' => 'Membre retiré'];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function markPresence(int $commissionId, int $userId, bool $present): array
    {
        try {
            $this->commissionModel->markPresence($commissionId, $userId, $present);
            return ['success' => true, 'message' => 'Présence mise à jour'];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function updateStatut(int $id, string $statut): array
    {
        try {
            $this->commissionModel->updateStatut($id, $statut);
            return ['success' => true, 'message' => 'Statut mis à jour'];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }
}
