<?php

namespace App\Controllers;

use App\Models\Demande;
use App\Models\Document;
use App\Models\User;
use App\Models\Decision;
use App\Models\Notification;
use App\Models\Contrat;
use App\Models\Local;

class DemandeController
{
    private Demande $demandeModel;
    private Document $documentModel;
    private User $userModel;
    private Decision $decisionModel;
    private Notification $notificationModel;
    private Contrat $contratModel;
    private Local $localModel;

    public function __construct()
    {
        $this->demandeModel = new Demande();
        $this->documentModel = new Document();
        $this->userModel = new User();
        $this->decisionModel = new Decision();
        $this->notificationModel = new Notification();
        $this->contratModel = new Contrat();
        $this->localModel = new Local();
    }

    public function create(int $userId, array $data): array
    {
        // Validate required fields
        $required = ['type_local', 'motif'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['error' => "Le champ {$field} est requis"];
            }
        }

        // Generate tracking number
        $numeroSuivi = $this->demandeModel->generateNumeroSuivi();

        $demandeData = [
            'numero_suivi' => $numeroSuivi,
            'user_id' => $userId,
            'type_local' => $data['type_local'],
            'motif' => $data['motif'],
            'description' => $data['description'] ?? null,
            'statut' => 'brouillon'
        ];

        try {
            $demandeId = $this->demandeModel->create($demandeData);
            $demande = $this->demandeModel->find($demandeId);
            
            return [
                'success' => true,
                'message' => 'Demande créée avec succès',
                'demande' => $demande
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la création: ' . $e->getMessage()];
        }
    }

    public function submit(int $demandeId, int $userId): array
    {
        $demande = $this->demandeModel->find($demandeId);
        
        if (!$demande) {
            return ['error' => 'Demande non trouvée'];
        }

        if ($demande['user_id'] !== $userId) {
            return ['error' => 'Non autorisé'];
        }

        if ($demande['statut'] !== 'brouillon') {
            return ['error' => 'Seules les demandes en brouillon peuvent être soumises'];
        }

        // Check document completeness
        $completeness = $this->documentModel->checkDemandeCompleteness($demandeId);
        if (!$completeness['complete']) {
            return [
                'error' => 'Documents incomplets',
                'details' => $completeness
            ];
        }

        try {
            $this->demandeModel->update($demandeId, [
                'statut' => 'soumis',
                'date_soumission' => date('Y-m-d H:i:s')
            ]);
            
            $updatedDemande = $this->demandeModel->find($demandeId);

            // Notify the secrétaire CSA that a new demand has been submitted
            $this->notificationModel->createForRole(
                'secretaireCSA',
                'demande',
                'Nouvelle demande soumise',
                "La demande {$updatedDemande['numero_suivi']} a été soumise et nécessite un tri.",
                ['demande_id' => $demandeId]
            );
            
            return [
                'success' => true,
                'message' => 'Demande soumise avec succès',
                'demande' => $updatedDemande
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la soumission: ' . $e->getMessage()];
        }
    }

    public function show(int $id, int $userId, string $userRole): array
    {
        $demande = $this->demandeModel->find($id);
        
        if (!$demande) {
            return ['error' => 'Demande non trouvée'];
        }

        // Check access permissions
        $allowedRoles = ['admin', 'dcuv', 'directeur', 'secretaireCSA'];
        if (!in_array($userRole, $allowedRoles) && $demande['user_id'] !== $userId) {
            return ['error' => 'Non autorisé'];
        }

        $demandeWithDocs = $this->demandeModel->getWithDocuments($id);
        
        return [
            'success' => true,
            'demande' => $demandeWithDocs
        ];
    }

    public function index(int $userId, string $userRole): array
    {
        $staffRoles = ['admin', 'dcuv', 'directeur', 'secretaireCSA'];
        if (in_array($userRole, $staffRoles)) {
            $demandes = $this->demandeModel->all();
        } else {
            $demandes = $this->demandeModel->findByUserId($userId);
        }

        return [
            'success' => true,
            'demandes' => $demandes,
            'count' => count($demandes)
        ];
    }

    public function update(int $id, int $userId, string $userRole, array $data): array
    {
        $demande = $this->demandeModel->find($id);
        
        if (!$demande) {
            return ['error' => 'Demande non trouvée'];
        }

        // Check permissions
        $staffRoles = ['admin', 'dcuv', 'directeur', 'secretaireCSA'];
        if (!in_array($userRole, $staffRoles) && $demande['user_id'] !== $userId) {
            return ['error' => 'Non autorisé'];
        }

        // Only allow updates on brouillon status for regular users
        if (!in_array($userRole, $staffRoles) && $demande['statut'] !== 'brouillon') {
            return ['error' => 'Impossible de modifier une demande soumise'];
        }

        try {
            $this->demandeModel->update($id, $data);
            $updatedDemande = $this->demandeModel->find($id);
            
            return [
                'success' => true,
                'message' => 'Demande mise à jour avec succès',
                'demande' => $updatedDemande
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la mise à jour: ' . $e->getMessage()];
        }
    }

    public function updateStatut(int $id, string $statut, int $instructeurId, ?string $commentaire = null): array
    {
        $demande = $this->demandeModel->find($id);
        
        if (!$demande) {
            return ['error' => 'Demande non trouvée'];
        }

        $oldStatut = $demande['statut'];

        try {
            $this->demandeModel->updateStatut($id, $statut, $instructeurId, $commentaire);
            $updatedDemande = $this->demandeModel->find($id);

            if ($statut === 'attribue') {
                $user = $this->userModel->find($demande['user_id']);
                if ($user && $user['role'] === 'visiteur') {
                    $this->userModel->updateRole($demande['user_id'], 'locataire');
                }

                $existingDecision = $this->decisionModel->findByDemandeId($id);
                if (!$existingDecision) {
                    $this->decisionModel->createAutoValidated($id, $instructeurId, 'attribue');
                }

                // Auto-generate contrat brouillon
                $existingContrat = $this->contratModel->findByDemandeId($id);
                if (!$existingContrat) {
                    $reference = $this->contratModel->generateReference();
                    $localId = $demande['local_id'] ?? null;
                    $montantLoyer = null;
                    if ($localId) {
                        $local = $this->localModel->find($localId);
                        if ($local) {
                            $montantLoyer = $local['loyer_mensuel'];
                            $this->localModel->updateStatut($localId, 'reserve');
                        }
                    }
                    $contratData = [
                        'reference' => $reference,
                        'demande_id' => $id,
                        'local_id' => $localId,
                        'locataire_id' => $demande['user_id'],
                        'date_debut' => date('Y-m-d'),
                        'date_fin' => null,
                        'montant_loyer' => $montantLoyer,
                        'periodicite' => 'mensuel',
                        'caution' => 0,
                        'conditions_particulieres' => null,
                        'statut' => 'brouillon'
                    ];
                    $this->contratModel->create($contratData);
                }
            }

            // Send notifications based on status change
            $this->sendStatusNotifications($id, $oldStatut, $statut, $demande, $commentaire);
            
            return [
                'success' => true,
                'message' => 'Statut mis à jour avec succès',
                'demande' => $updatedDemande
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la mise à jour du statut: ' . $e->getMessage()];
        }
    }

    private function sendStatusNotifications(int $id, string $oldStatut, string $newStatut, array $demande, ?string $commentaire): void
    {
        $numeroSuivi = $demande['numero_suivi'] ?? "#{$id}";

        switch ($newStatut) {
            case 'incomplet':
                // Notify the demandeur that their demand is incomplete
                $this->notificationModel->createForUser(
                    $demande['user_id'],
                    'demande',
                    'Demande incomplète',
                    "Votre demande {$numeroSuivi} est incomplète." . ($commentaire ? " Motif: {$commentaire}" : ''),
                    ['demande_id' => $id]
                );
                break;

            case 'recevable':
                // Notify DCUV that a demand is recevable and ready for instruction
                $this->notificationModel->createForRole(
                    'dcuv',
                    'demande',
                    'Demande recevable à instruire',
                    "La demande {$numeroSuivi} a été marquée recevable par le secrétariat.",
                    ['demande_id' => $id]
                );
                // Notify the demandeur
                $this->notificationModel->createForUser(
                    $demande['user_id'],
                    'demande',
                    'Demande recevable',
                    "Votre demande {$numeroSuivi} a été jugée recevable et est en cours d'instruction.",
                    ['demande_id' => $id]
                );
                break;

            case 'en_instruction':
                // Notify the demandeur
                $this->notificationModel->createForUser(
                    $demande['user_id'],
                    'demande',
                    'Demande en instruction',
                    "Votre demande {$numeroSuivi} est en cours d'instruction par le DCUV.",
                    ['demande_id' => $id]
                );
                break;

            case 'rejete':
                // Notify the demandeur
                $this->notificationModel->createForUser(
                    $demande['user_id'],
                    'demande',
                    'Demande rejetée',
                    "Votre demande {$numeroSuivi} a été rejetée." . ($commentaire ? " Motif: {$commentaire}" : ''),
                    ['demande_id' => $id]
                );
                // Notify the Directeur
                $this->notificationModel->createForRole(
                    'directeur',
                    'decision',
                    'Demande rejetée',
                    "La demande {$numeroSuivi} a été rejetée.",
                    ['demande_id' => $id]
                );
                break;

            case 'attribue':
                // Notify the demandeur
                $this->notificationModel->createForUser(
                    $demande['user_id'],
                    'demande',
                    'Demande approuvée',
                    "Votre demande {$numeroSuivi} a été approuvée. Un contrat sera créé prochainement.",
                    ['demande_id' => $id]
                );
                // Notify the Directeur of the final decision
                $this->notificationModel->createForRole(
                    'directeur',
                    'decision',
                    'Décision finale: demande approuvée',
                    "La demande {$numeroSuivi} a été approuvée et attribuée.",
                    ['demande_id' => $id]
                );
                break;

            case 'non_attribue':
                // Notify the demandeur
                $this->notificationModel->createForUser(
                    $demande['user_id'],
                    'demande',
                    'Demande non attribuée',
                    "Votre demande {$numeroSuivi} n'a pas été attribuée." . ($commentaire ? " Motif: {$commentaire}" : ''),
                    ['demande_id' => $id]
                );
                // Notify the Directeur
                $this->notificationModel->createForRole(
                    'directeur',
                    'decision',
                    'Décision finale: non attribuée',
                    "La demande {$numeroSuivi} n'a pas été attribuée.",
                    ['demande_id' => $id]
                );
                break;

            case 'en_commission':
                // Notify the demandeur
                $this->notificationModel->createForUser(
                    $demande['user_id'],
                    'demande',
                    'Demande en commission',
                    "Votre demande {$numeroSuivi} a été transmise en commission.",
                    ['demande_id' => $id]
                );
                break;
        }
    }

    public function getMyDemandes(int $userId): array
    {
        $demandes = $this->demandeModel->findByUserId($userId);
        
        return [
            'success' => true,
            'demandes' => $demandes,
            'count' => count($demandes)
        ];
    }

    public function getByNumeroSuivi(string $numeroSuivi, int $userId, string $userRole): array
    {
        $demande = $this->demandeModel->findByNumeroSuivi($numeroSuivi);
        
        if (!$demande) {
            return ['error' => 'Demande non trouvée'];
        }

        // Check access permissions
        $allowedRoles = ['admin', 'dcuv', 'directeur', 'secretaireCSA'];
        if (!in_array($userRole, $allowedRoles) && $demande['user_id'] !== $userId) {
            return ['error' => 'Non autorisé'];
        }

        $demandeWithDocs = $this->demandeModel->getWithDocuments($demande['id']);
        
        return [
            'success' => true,
            'demande' => $demandeWithDocs
        ];
    }

    public function getPendingInstruction(): array
    {
        $demandes = $this->demandeModel->getPendingInstruction();
        
        return [
            'success' => true,
            'demandes' => $demandes,
            'count' => count($demandes)
        ];
    }

    public function getForDCUVInstruction(): array
    {
        $demandes = $this->demandeModel->getForDCUVInstruction();
        
        return [
            'success' => true,
            'demandes' => $demandes,
            'count' => count($demandes)
        ];
    }

    public function getRecevables(): array
    {
        $demandes = $this->demandeModel->getRecevables();
        
        return [
            'success' => true,
            'demandes' => $demandes,
            'count' => count($demandes)
        ];
    }

    public function getDecided(): array
    {
        $demandes = $this->demandeModel->getDecided();
        
        return [
            'success' => true,
            'demandes' => $demandes,
            'count' => count($demandes)
        ];
    }

    public function getStats(): array
    {
        $stats = $this->demandeModel->getStats();
        
        return [
            'success' => true,
            'stats' => $stats
        ];
    }

    public function uploadDocument(int $demandeId, int $userId, array $files, array $post): array
    {
        $demande = $this->demandeModel->find($demandeId);

        if (!$demande) {
            return ['error' => 'Demande non trouvée'];
        }

        if ($demande['user_id'] !== $userId) {
            return ['error' => 'Non autorisé'];
        }

        if ($demande['statut'] !== 'brouillon') {
            return ['error' => 'Impossible d\'ajouter des documents à une demande soumise'];
        }

        $typeDocument = $post['type_document'] ?? null;
        $validTypes = ['cni', 'casier_judiciaire', 'attestation_residence', 'plan_affaires', 'autre'];

        if (!$typeDocument || !in_array($typeDocument, $validTypes)) {
            return ['error' => 'Type de document invalide'];
        }

        if (!isset($files['file']) || $files['file']['error'] !== UPLOAD_ERR_OK) {
            return ['error' => 'Aucun fichier reçu ou erreur lors de l\'upload'];
        }

        $file = $files['file'];
        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

        if (!in_array($file['type'], $allowedMimes)) {
            return ['error' => 'Format de fichier non autorisé. Formats acceptés: PDF, JPG, PNG, WebP'];
        }

        $maxSize = 10 * 1024 * 1024; // 10 MB
        if ($file['size'] > $maxSize) {
            return ['error' => 'Le fichier ne doit pas dépasser 10 Mo'];
        }

        $uploadDir = __DIR__ . '/../../uploads/documents/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $safeName = $typeDocument . '_' . $demandeId . '_' . time() . '.' . $extension;
        $targetPath = $uploadDir . $safeName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            return ['error' => 'Erreur lors de l\'enregistrement du fichier'];
        }

        // Remove existing document of same type (replace)
        $existing = $this->documentModel->findByType($typeDocument, $demandeId);
        if ($existing) {
            $oldPath = $uploadDir . $existing['nom_fichier'];
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
            $this->documentModel->delete($existing['id']);
        }

        $docData = [
            'demande_id' => $demandeId,
            'type_document' => $typeDocument,
            'nom_fichier' => $safeName,
            'url_fichier' => '/uploads/documents/' . $safeName,
            'taille' => $file['size'],
            'mime_type' => $file['type'],
            'statut' => 'en_attente'
        ];

        try {
            $docId = $this->documentModel->create($docData);
            $document = $this->documentModel->find($docId);

            return [
                'success' => true,
                'message' => 'Document téléversé avec succès',
                'document' => $document
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de l\'enregistrement: ' . $e->getMessage()];
        }
    }

    public function getDocuments(int $demandeId, int $userId, string $userRole): array
    {
        $demande = $this->demandeModel->find($demandeId);

        if (!$demande) {
            return ['error' => 'Demande non trouvée'];
        }

        $allowedRoles = ['admin', 'dcuv', 'directeur', 'secretaireCSA'];
        if (!in_array($userRole, $allowedRoles) && $demande['user_id'] !== $userId) {
            return ['error' => 'Non autorisé'];
        }

        $documents = $this->documentModel->findByDemandeId($demandeId);

        return [
            'success' => true,
            'documents' => $documents
        ];
    }
}
