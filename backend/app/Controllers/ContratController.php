<?php

namespace App\Controllers;

use App\Models\Contrat;
use App\Models\Demande;
use App\Models\Local;
use App\Models\Decision;

class ContratController
{
    private Contrat $contratModel;
    private Demande $demandeModel;
    private Local $localModel;
    private Decision $decisionModel;

    public function __construct()
    {
        $this->contratModel = new Contrat();
        $this->demandeModel = new Demande();
        $this->localModel = new Local();
        $this->decisionModel = new Decision();
    }

    public function createFromDecision(int $decisionId, array $data, ?array $files = null): array
    {
        $decision = $this->decisionModel->find($decisionId);
        if (!$decision) {
            return ['error' => 'Décision non trouvée'];
        }

        if ($decision['decision'] !== 'attribue') {
            return ['error' => 'La décision doit être une attribution'];
        }

        if ($decision['statut'] !== 'validee') {
            return ['error' => 'La décision doit être validée par le Directeur'];
        }

        $demande = $this->demandeModel->find($decision['demande_id']);
        if (!$demande) {
            return ['error' => 'Demande non trouvée'];
        }

        // Check if contrat already exists
        $existing = $this->contratModel->findByDemandeId($demande['id']);
        if ($existing) {
            return ['error' => 'Un contrat existe déjà pour cette demande'];
        }

        $fichierContratPath = null;
        if ($files && isset($files['fichier_contrat']) && $files['fichier_contrat']['error'] === UPLOAD_ERR_OK) {
            $file = $files['fichier_contrat'];
            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
            if (!in_array($file['type'], $allowedMimes)) {
                return ['error' => 'Format de fichier non autorisé. Formats acceptés: PDF, JPG, PNG, WebP'];
            }
            $maxSize = 10 * 1024 * 1024;
            if ($file['size'] > $maxSize) {
                return ['error' => 'Le fichier ne doit pas dépasser 10 Mo'];
            }
            $uploadDir = __DIR__ . '/../../uploads/contrats/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $safeName = 'contrat_' . time() . '.' . $extension;
            $targetPath = $uploadDir . $safeName;
            if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
                return ['error' => 'Erreur lors de l\'enregistrement du fichier'];
            }
            $fichierContratPath = '/uploads/contrats/' . $safeName;
        }

        $reference = $this->contratModel->generateReference();

        $contratData = [
            'reference' => $reference,
            'demande_id' => $demande['id'],
            'local_id' => $data['local_id'] ?? null,
            'locataire_id' => $demande['user_id'],
            'date_debut' => $data['date_debut'],
            'date_fin' => $data['date_fin'] ?? null,
            'montant_loyer' => $data['montant_loyer'] ?? null,
            'periodicite' => $data['periodicite'] ?? 'mensuel',
            'caution' => $data['caution'] ?? 0,
            'conditions_particulieres' => $data['conditions_particulieres'] ?? null,
            'fichier_contrat' => $fichierContratPath,
            'statut' => 'en_validation_directeur'
        ];

        try {
            $contratId = $this->contratModel->create($contratData);
            
            // Update local status if assigned
            if (!empty($data['local_id'])) {
                $this->localModel->updateStatut((int)$data['local_id'], 'reserve');
            }

            $contrat = $this->contratModel->getWithDetails($contratId);
            
            return [
                'success' => true,
                'message' => 'Contrat créé et envoyé au Directeur pour validation',
                'contrat' => $contrat
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la création: ' . $e->getMessage()];
        }
    }

    public function show(int $id, int $userId, string $userRole): array
    {
        $contrat = $this->contratModel->getWithDetails($id);
        if (!$contrat) {
            return ['error' => 'Contrat non trouvé'];
        }

        // Check access
        if ($userRole !== 'admin' && $userRole !== 'dcuv' && $userRole !== 'directeur' 
            && $contrat['locataire_id'] !== $userId) {
            return ['error' => 'Non autorisé'];
        }

        return ['success' => true, 'contrat' => $contrat];
    }

    public function index(int $userId, string $userRole): array
    {
        if (in_array($userRole, ['admin', 'dcuv', 'directeur'])) {
            $contrats = $this->contratModel->all();
        } else {
            $contrats = $this->contratModel->findByLocataireId($userId);
        }

        return ['success' => true, 'contrats' => $contrats, 'count' => count($contrats)];
    }

    public function getPendingSignature(): array
    {
        $contrats = $this->contratModel->getPendingSignature();
        return ['success' => true, 'contrats' => $contrats, 'count' => count($contrats)];
    }

    public function getActive(): array
    {
        $contrats = $this->contratModel->getActiveContrats();
        return ['success' => true, 'contrats' => $contrats, 'count' => count($contrats)];
    }

    public function sendForSignature(int $id): array
    {
        $contrat = $this->contratModel->find($id);
        if (!$contrat) {
            return ['error' => 'Contrat non trouvé'];
        }

        if ($contrat['statut'] !== 'brouillon') {
            return ['error' => 'Seuls les contrats en brouillon peuvent être envoyés'];
        }

        try {
            $this->contratModel->updateStatut($id, 'en_attente_signature');
            $updated = $this->contratModel->find($id);
            
            return [
                'success' => true,
                'message' => 'Contrat envoyé pour signature',
                'contrat' => $updated
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function signByLocataire(int $id, int $userId): array
    {
        $contrat = $this->contratModel->find($id);
        if (!$contrat) {
            return ['error' => 'Contrat non trouvé'];
        }

        if ($contrat['locataire_id'] !== $userId) {
            return ['error' => 'Non autorisé'];
        }

        if ($contrat['statut'] !== 'en_attente_signature' && $contrat['statut'] !== 'brouillon') {
            return ['error' => 'Contrat non disponible pour signature'];
        }

        try {
            $this->contratModel->signByLocataire($id);
            $updated = $this->contratModel->find($id);
            
            // If both signed, activate
            if ($updated['signe_par_locataire'] && $updated['signe_par_dcuv']) {
                $this->contratModel->activate($id);
                $updated = $this->contratModel->find($id);
            }
            
            return [
                'success' => true,
                'message' => 'Contrat signé par le locataire',
                'contrat' => $updated
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function signByDcuv(int $id): array
    {
        $contrat = $this->contratModel->find($id);
        if (!$contrat) {
            return ['error' => 'Contrat non trouvé'];
        }

        try {
            $this->contratModel->signByDcuv($id);
            $updated = $this->contratModel->find($id);
            
            // If both signed, activate
            if ($updated['signe_par_locataire'] && $updated['signe_par_dcuv']) {
                $this->contratModel->activate($id);
                // Update local status to occupied
                if ($updated['local_id']) {
                    $this->localModel->updateStatut($updated['local_id'], 'occupe');
                }
                $updated = $this->contratModel->find($id);
            }
            
            return [
                'success' => true,
                'message' => 'Contrat signé par la DCUV',
                'contrat' => $updated
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function resiliate(int $id, ?string $motif = null): array
    {
        $contrat = $this->contratModel->find($id);
        if (!$contrat) {
            return ['error' => 'Contrat non trouvé'];
        }

        if ($contrat['statut'] !== 'actif') {
            return ['error' => 'Seuls les contrats actifs peuvent être résiliés'];
        }

        try {
            $this->contratModel->resiliate($id, $motif);
            
            // Free the local
            if ($contrat['local_id']) {
                $this->localModel->updateStatut($contrat['local_id'], 'disponible');
            }
            
            $updated = $this->contratModel->find($id);
            
            return [
                'success' => true,
                'message' => 'Contrat résilié',
                'contrat' => $updated
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function getMyContrats(int $userId): array
    {
        $contrats = $this->contratModel->findByLocataireId($userId);
        return ['success' => true, 'contrats' => $contrats, 'count' => count($contrats)];
    }

    public function getStats(): array
    {
        $stats = $this->contratModel->getStats();
        return ['success' => true, 'stats' => $stats];
    }

    public function update(int $id, array $data): array
    {
        $contrat = $this->contratModel->find($id);
        if (!$contrat) {
            return ['error' => 'Contrat non trouvé'];
        }

        if ($contrat['statut'] !== 'brouillon') {
            return ['error' => 'Seuls les contrats en brouillon peuvent être modifiés'];
        }

        try {
            $this->contratModel->update($id, $data);
            $updated = $this->contratModel->getWithDetails($id);
            
            return [
                'success' => true,
                'message' => 'Contrat mis à jour',
                'contrat' => $updated
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function getPendingDirecteurValidation(): array
    {
        $contrats = $this->contratModel->getPendingDirecteurValidation();
        return ['success' => true, 'contrats' => $contrats, 'count' => count($contrats)];
    }

    public function validateByDirecteur(int $id, int $directeurId, array $data): array
    {
        $contrat = $this->contratModel->find($id);
        if (!$contrat) {
            return ['error' => 'Contrat non trouvé'];
        }

        if ($contrat['statut'] !== 'en_validation_directeur') {
            return ['error' => 'Ce contrat n\'est pas en attente de validation du Directeur'];
        }

        $decision = $data['decision'] ?? null;
        if (!in_array($decision, ['approuve', 'rejete'])) {
            return ['error' => 'Décision invalide (approuve ou rejete)'];
        }

        $commentaire = $data['commentaire'] ?? null;

        try {
            $this->contratModel->validateByDirecteur($id, $directeurId, $decision, $commentaire);
            $updated = $this->contratModel->getWithDetails($id);
            
            return [
                'success' => true,
                'message' => $decision === 'approuve' ? 'Contrat approuvé par le Directeur' : 'Contrat rejeté par le Directeur',
                'contrat' => $updated
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function getValidatedDecisionsWithoutContrat(): array
    {
        $decisions = $this->decisionModel->getValidatedWithoutContrat();
        return ['success' => true, 'decisions' => $decisions, 'count' => count($decisions)];
    }
}
