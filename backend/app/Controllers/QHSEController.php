<?php

namespace App\Controllers;

use App\Models\ControleQHSE;
use App\Models\Sanction;
use App\Models\Contrat;

class QHSEController
{
    private ControleQHSE $controleModel;
    private Sanction $sanctionModel;
    private Contrat $contratModel;

    public function __construct()
    {
        $this->controleModel = new ControleQHSE();
        $this->sanctionModel = new Sanction();
        $this->contratModel = new Contrat();
    }

    // Controles QHSE
    public function createControle(int $controleurId, array $data): array
    {
        $required = ['local_id', 'type_controle'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['error' => "Le champ {$field} est requis"];
            }
        }

        $validTypes = ['periodique', 'signalement', 'fin_bail', 'pre_affectation'];
        if (!in_array($data['type_controle'], $validTypes)) {
            return ['error' => 'Type de contrôle invalide'];
        }

        $reference = $this->controleModel->generateReference();

        $controleData = [
            'reference' => $reference,
            'local_id' => (int)$data['local_id'],
            'controleur_id' => $controleurId,
            'type_controle' => $data['type_controle'],
            'statut' => 'planifie'
        ];

        try {
            $id = $this->controleModel->create($controleData);
            $controle = $this->controleModel->getWithDetails($id);
            return ['success' => true, 'message' => 'Contrôle créé', 'controle' => $controle];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function showControle(int $id): array
    {
        $controle = $this->controleModel->getWithDetails($id);
        if (!$controle) {
            return ['error' => 'Contrôle non trouvé'];
        }
        $sanctions = $this->sanctionModel->getByControleId($id);
        $controle['sanctions'] = $sanctions;
        return ['success' => true, 'controle' => $controle];
    }

    public function indexControles(int $userId, string $userRole): array
    {
        if (in_array($userRole, ['admin', 'dcuv'])) {
            $controles = $this->controleModel->all();
        } else {
            $controles = $this->controleModel->findByControleurId($userId);
        }
        return ['success' => true, 'controles' => $controles, 'count' => count($controles)];
    }

    public function getLocataireControles(int $locataireId): array
    {
        $contrats = $this->contratModel->findByLocataireId($locataireId);
        $controles = [];
        foreach ($contrats as $contrat) {
            if (!empty($contrat['local_id'])) {
                $controles = array_merge($controles, $this->controleModel->findByLocalId((int)$contrat['local_id']));
            }
        }
        return ['success' => true, 'controles' => $controles, 'count' => count($controles)];
    }

    public function getPendingControles(): array
    {
        $controles = $this->controleModel->getPending();
        return ['success' => true, 'controles' => $controles, 'count' => count($controles)];
    }

    public function getCompletedControles(): array
    {
        $controles = $this->controleModel->getCompleted();
        return ['success' => true, 'controles' => $controles, 'count' => count($controles)];
    }

    public function recordScores(int $id, array $data): array
    {
        $controle = $this->controleModel->find($id);
        if (!$controle) {
            return ['error' => 'Contrôle non trouvé'];
        }

        $required = ['score_proprete', 'score_securite', 'score_entretien'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] < 0 || $data[$field] > 100) {
                return ['error' => "Score {$field} invalide (0-100)"];
            }
        }

        try {
            $this->controleModel->updateScores(
                $id,
                [
                    'score_proprete' => (int)$data['score_proprete'],
                    'score_securite' => (int)$data['score_securite'],
                    'score_entretien' => (int)$data['score_entretien']
                ],
                $data['observations'] ?? null,
                $data['recommandations'] ?? null
            );

            $updated = $this->controleModel->getWithDetails($id);
            return ['success' => true, 'message' => 'Scores enregistrés', 'controle' => $updated];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function getControleStats(): array
    {
        $stats = $this->controleModel->getStats();
        return ['success' => true, 'stats' => $stats];
    }

    // Sanctions
    public function createSanction(int $creePar, array $data): array
    {
        $required = ['locataire_id', 'type_sanction', 'motif'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['error' => "Le champ {$field} est requis"];
            }
        }

        $validTypes = ['avertissement', 'mise_en_demeure', 'penalite_financiere', 'resiliation_bail', 'suspension'];
        if (!in_array($data['type_sanction'], $validTypes)) {
            return ['error' => 'Type de sanction invalide'];
        }

        $reference = $this->sanctionModel->generateReference();

        $sanctionData = [
            'reference' => $reference,
            'locataire_id' => (int)$data['locataire_id'],
            'local_id' => $data['local_id'] ?? null,
            'controle_id' => $data['controle_id'] ?? null,
            'type_sanction' => $data['type_sanction'],
            'motif' => $data['motif'],
            'description' => $data['description'] ?? null,
            'date_debut' => $data['date_debut'] ?? null,
            'date_fin' => $data['date_fin'] ?? null,
            'statut' => 'active',
            'cree_par' => $creePar
        ];

        try {
            $id = $this->sanctionModel->create($sanctionData);
            $sanction = $this->sanctionModel->getWithDetails($id);
            return ['success' => true, 'message' => 'Sanction créée', 'sanction' => $sanction];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function showSanction(int $id): array
    {
        $sanction = $this->sanctionModel->getWithDetails($id);
        if (!$sanction) {
            return ['error' => 'Sanction non trouvée'];
        }
        return ['success' => true, 'sanction' => $sanction];
    }

    public function indexSanctions(int $userId, string $userRole): array
    {
        if (in_array($userRole, ['admin', 'dcuv'])) {
            $sanctions = $this->sanctionModel->all();
        } else {
            $sanctions = $this->sanctionModel->findByLocataireId($userId);
        }
        return ['success' => true, 'sanctions' => $sanctions, 'count' => count($sanctions)];
    }

    public function getActiveSanctions(): array
    {
        $sanctions = $this->sanctionModel->getActive();
        return ['success' => true, 'sanctions' => $sanctions, 'count' => count($sanctions)];
    }

    public function leverSanction(int $id): array
    {
        $sanction = $this->sanctionModel->find($id);
        if (!$sanction) {
            return ['error' => 'Sanction non trouvée'];
        }

        if ($sanction['statut'] !== 'active') {
            return ['error' => 'Sanction déjà levée ou expirée'];
        }

        try {
            $this->sanctionModel->lever($id);
            $updated = $this->sanctionModel->find($id);
            return ['success' => true, 'message' => 'Sanction levée', 'sanction' => $updated];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function getSanctionStats(): array
    {
        $stats = $this->sanctionModel->getStats();
        return ['success' => true, 'stats' => $stats];
    }
}
