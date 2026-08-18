<?php

namespace App\Controllers;

use App\Models\Local;
use App\Models\TransfertLocal;
use App\Models\Contrat;
use App\Models\User;
use App\Models\Notification;

class LocalController
{
    private Local $localModel;
    private TransfertLocal $transfertModel;
    private Contrat $contratModel;
    private User $userModel;
    private Notification $notificationModel;

    public function __construct()
    {
        $this->localModel = new Local();
        $this->transfertModel = new TransfertLocal();
        $this->contratModel = new Contrat();
        $this->userModel = new User();
        $this->notificationModel = new Notification();
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
        $required = ['type', 'usage'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['error' => "Le champ {$field} est requis"];
            }
        }

        $data['reference'] = $this->localModel->generateReference();

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
    public function createTransfert(array $data, int $ancienLocataireId): array
    {
        $required = ['local_id'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['error' => "Le champ {$field} est requis"];
            }
        }

        // Validate new applicant info
        $applicantFields = ['nom', 'prenom', 'email', 'telephone'];
        foreach ($applicantFields as $field) {
            if (empty($data[$field])) {
                return ['error' => "Le champ {$field} du nouveau demandeur est requis"];
            }
        }

        $local = $this->localModel->find((int)$data['local_id']);
        if (!$local) {
            return ['error' => 'Local non trouvé'];
        }

        // Check if email already exists
        $existingUser = $this->userModel->findByEmail($data['email']);
        if ($existingUser) {
            return ['error' => 'Un utilisateur avec cet email existe déjà'];
        }

        try {
            // Create a visiteur account for the new applicant
            $tempPassword = bin2hex(random_bytes(4));
            $userId = $this->userModel->create([
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'email' => $data['email'],
                'telephone' => $data['telephone'],
                'numero_cni' => $data['numero_cni'] ?? null,
                'password' => $tempPassword,
                'role' => 'visiteur',
                'statut' => 'actif'
            ]);

            $transfertData = [
                'local_id' => (int)$data['local_id'],
                'ancien_locataire_id' => $ancienLocataireId,
                'nouveau_locataire_id' => $userId,
                'motif' => $data['motif'] ?? null,
                'statut' => 'en_attente'
            ];

            // Find active contract for ancien locataire
            $ancienContrats = $this->contratModel->findByLocataireId($ancienLocataireId);
            foreach ($ancienContrats as $c) {
                if ($c['statut'] === 'actif') {
                    $transfertData['ancien_contrat_id'] = $c['id'];
                    break;
                }
            }

            $transfertId = $this->transfertModel->create($transfertData);
            $transfert = $this->transfertModel->find($transfertId);

            // Notify all DCUV users
            $this->notificationModel->createForRole(
                'dcuv',
                'systeme',
                'Demande de transfert de local',
                "Le locataire demande à céder le local {$local['reference']} à un nouveau demandeur: {$data['prenom']} {$data['nom']}",
                ['transfert_id' => $transfertId, 'local_id' => $local['id']]
            );

            return ['success' => true, 'message' => 'Transfert demandé. Le DCUV a été informé.', 'transfert' => $transfert];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function getMyTransferts(int $userId): array
    {
        $transferts = $this->transfertModel->findByUserId($userId);
        return ['success' => true, 'transferts' => $transferts, 'count' => count($transferts)];
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

                // Promote new applicant to locataire
                $newUser = $this->userModel->find($transfert['nouveau_locataire_id']);
                if ($newUser && $newUser['role'] === 'visiteur') {
                    $this->userModel->updateRole($transfert['nouveau_locataire_id'], 'locataire');
                }

                // Notify the new applicant
                $this->notificationModel->createForUser(
                    $transfert['nouveau_locataire_id'],
                    'systeme',
                    'Transfert validé',
                    'Votre transfert de local a été validé. Vous êtes maintenant locataire.'
                );

                // Notify the ancien locataire
                if ($transfert['ancien_locataire_id']) {
                    $this->notificationModel->createForUser(
                        $transfert['ancien_locataire_id'],
                        'systeme',
                        'Transfert validé',
                        'Votre demande de transfert de local a été validée.'
                    );
                }
            } else {
                // Notify the ancien locataire of refusal
                if ($transfert['ancien_locataire_id']) {
                    $this->notificationModel->createForUser(
                        $transfert['ancien_locataire_id'],
                        'systeme',
                        'Transfert refusé',
                        'Votre demande de transfert de local a été refusée.'
                    );
                }
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
