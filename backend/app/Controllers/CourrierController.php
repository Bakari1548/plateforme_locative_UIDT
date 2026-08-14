<?php

namespace App\Controllers;

use App\Models\Courrier;

class CourrierController
{
    private Courrier $courrierModel;

    public function __construct()
    {
        $this->courrierModel = new Courrier();
    }

    public function create(int $expediteurId, array $data): array
    {
        $required = ['destinataire_id', 'type_courrier', 'objet'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['error' => "Le champ {$field} est requis"];
            }
        }

        $validTypes = ['demande_complements', 'notification_instruction', 'invitation_commission', 'notification_decision', 'relance', 'autre'];
        if (!in_array($data['type_courrier'], $validTypes)) {
            return ['error' => 'Type de courrier invalide'];
        }

        $reference = $this->courrierModel->generateReference();

        $courrierData = [
            'reference' => $reference,
            'demande_id' => $data['demande_id'] ?? null,
            'destinataire_id' => (int)$data['destinataire_id'],
            'expediteur_id' => $expediteurId,
            'type_courrier' => $data['type_courrier'],
            'objet' => $data['objet'],
            'contenu' => $data['contenu'] ?? null,
            'statut' => 'en_attente'
        ];

        try {
            $id = $this->courrierModel->create($courrierData);
            $courrier = $this->courrierModel->find($id);
            return ['success' => true, 'message' => 'Courrier créé', 'courrier' => $courrier];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function show(int $id): array
    {
        $courrier = $this->courrierModel->find($id);
        if (!$courrier) {
            return ['error' => 'Courrier non trouvé'];
        }
        return ['success' => true, 'courrier' => $courrier];
    }

    public function index(int $userId, string $userRole): array
    {
        if (in_array($userRole, ['admin', 'dcuv', 'agentCourrier'])) {
            $courriers = $this->courrierModel->all();
        } else {
            $courriers = $this->courrierModel->findByDestinataire($userId);
        }
        return ['success' => true, 'courriers' => $courriers, 'count' => count($courriers)];
    }

    public function getSent(int $expediteurId): array
    {
        $courriers = $this->courrierModel->findByExpediteur($expediteurId);
        return ['success' => true, 'courriers' => $courriers, 'count' => count($courriers)];
    }

    public function getReceived(int $destinataireId): array
    {
        $courriers = $this->courrierModel->findByDestinataire($destinataireId);
        return ['success' => true, 'courriers' => $courriers, 'count' => count($courriers)];
    }

    public function getUnread(int $userId): array
    {
        $courriers = $this->courrierModel->getUnreadForUser($userId);
        return ['success' => true, 'courriers' => $courriers, 'count' => count($courriers)];
    }

    public function send(int $id): array
    {
        $courrier = $this->courrierModel->find($id);
        if (!$courrier) {
            return ['error' => 'Courrier non trouvé'];
        }

        if ($courrier['statut'] !== 'en_attente') {
            return ['error' => 'Courrier déjà envoyé'];
        }

        $this->courrierModel->updateStatut($id, 'envoye');
        $updated = $this->courrierModel->find($id);
        return ['success' => true, 'message' => 'Courrier envoyé', 'courrier' => $updated];
    }

    public function markAsRead(int $id): array
    {
        $courrier = $this->courrierModel->find($id);
        if (!$courrier) {
            return ['error' => 'Courrier non trouvé'];
        }

        $this->courrierModel->markAsLu($id);
        $updated = $this->courrierModel->find($id);
        return ['success' => true, 'message' => 'Courrier marqué comme lu', 'courrier' => $updated];
    }

    public function getByDemande(int $demandeId): array
    {
        $courriers = $this->courrierModel->findByDemandeId($demandeId);
        return ['success' => true, 'courriers' => $courriers, 'count' => count($courriers)];
    }
}
