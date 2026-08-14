<?php

namespace App\Controllers;

use App\Models\Local;
use App\Models\TransfertLocal;
use App\Models\Contrat;

class LocalController
{
    private Local $localModel;
    private TransfertLocal $transfertModel;
    private Contrat $contratModel;

    public function __construct()
    {
        $this->localModel = new Local();
        $this->transfertModel = new TransfertLocal();
        $this->contratModel = new Contrat();
    }

    public function index(): array
    {
        $locaux = $this->localModel->all();
        return ['success' => true, 'locaux' => $locaux, 'count' => count($locaux)];
    }

    public function show(int $id): array
    {
        $local = $this->localModel->find($id);
        if (!$local) {
            return ['error' => 'Local non trouvé'];
        }

        $transferts = $this->transfertModel->findByLocalId($id);
        $local['transferts'] = $transferts;

        return ['success' => true, 'local' => $local];
    }

    public function create(array $data): array
    {
        $required = ['reference', 'type', 'usage'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['error' => "Le champ {$field} est requis"];
            }
        }

        if ($this->localModel->findByReference($data['reference'])) {
            return ['error' => 'Cette référence existe déjà'];
        }

        $validTypes = ['cantine', 'boutique', 'kiosque', 'bureau', 'autre'];
        if (!in_array($data['type'], $validTypes)) {
            return ['error' => 'Type de local invalide'];
        }

        $validStatuts = ['disponible', 'occupe', 'en_maintenance', 'reserve', 'inactif'];
        $data['statut'] = $data['statut'] ?? 'disponible';
        if (!in_array($data['statut'], $validStatuts)) {
            return ['error' => 'Statut invalide'];
        }

        try {
            $id = $this->localModel->create($data);
            $local = $this->localModel->find($id);
            return ['success' => true, 'message' => 'Local créé', 'local' => $local];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function update(int $id, array $data): array
    {
        $local = $this->localModel->find($id);
        if (!$local) {
            return ['error' => 'Local non trouvé'];
        }

        try {
            $this->localModel->update($id, $data);
            $updated = $this->localModel->find($id);
            return ['success' => true, 'message' => 'Local mis à jour', 'local' => $updated];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function delete(int $id): array
    {
        $local = $this->localModel->find($id);
        if (!$local) {
            return ['error' => 'Local non trouvé'];
        }

        if ($local['statut'] === 'occupe') {
            return ['error' => 'Impossible de supprimer un local occupé'];
        }

        try {
            $this->localModel->delete($id);
            return ['success' => true, 'message' => 'Local supprimé'];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function updateStatut(int $id, string $statut): array
    {
        $local = $this->localModel->find($id);
        if (!$local) {
            return ['error' => 'Local non trouvé'];
        }

        try {
            $this->localModel->updateStatut($id, $statut);
            $updated = $this->localModel->find($id);
            return ['success' => true, 'message' => 'Statut mis à jour', 'local' => $updated];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function getAvailable(): array
    {
        $locaux = $this->localModel->getAvailable();
        return ['success' => true, 'locaux' => $locaux, 'count' => count($locaux)];
    }

    public function getByType(string $type): array
    {
        $locaux = $this->localModel->findByType($type);
        return ['success' => true, 'locaux' => $locaux, 'count' => count($locaux)];
    }

    public function getByZone(string $zone): array
    {
        $locaux = $this->localModel->findByZone($zone);
        return ['success' => true, 'locaux' => $locaux, 'count' => count($locaux)];
    }

    public function search(string $query): array
    {
        $locaux = $this->localModel->search($query);
        return ['success' => true, 'locaux' => $locaux, 'count' => count($locaux)];
    }

    public function getStats(): array
    {
        $stats = $this->localModel->getStats();
        return ['success' => true, 'stats' => $stats];
    }

    // Transferts
    public function createTransfert(array $data): array
    {
        $required = ['local_id', 'nouveau_locataire_id'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['error' => "Le champ {$field} est requis"];
            }
        }

        $local = $this->localModel->find((int)$data['local_id']);
        if (!$local) {
            return ['error' => 'Local non trouvé'];
        }

        try {
            $transfertId = $this->transfertModel->create($data);
            $transfert = $this->transfertModel->find($transfertId);
            return ['success' => true, 'message' => 'Transfert demandé', 'transfert' => $transfert];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function validateTransfert(int $id, int $validePar, string $statut): array
    {
        $transfert = $this->transfertModel->find($id);
        if (!$transfert) {
            return ['error' => 'Transfert non trouvé'];
        }

        if ($transfert['statut'] !== 'en_attente') {
            return ['error' => 'Transfert déjà traité'];
        }

        try {
            $this->transfertModel->updateStatut($id, $statut, $validePar);

            if ($statut === 'valide') {
                // Update local status
                $this->localModel->updateStatut($transfert['local_id'], 'occupe');
            }

            $updated = $this->transfertModel->find($id);
            return ['success' => true, 'message' => 'Transfert ' . $statut, 'transfert' => $updated];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function getPendingTransferts(): array
    {
        $transferts = $this->transfertModel->getPending();
        return ['success' => true, 'transferts' => $transferts, 'count' => count($transferts)];
    }

    public function getTransfertHistory(int $localId): array
    {
        $history = $this->transfertModel->getHistory($localId);
        return ['success' => true, 'history' => $history];
    }
}
