<?php

namespace App\Controllers;

use App\Models\Demande;
use App\Models\Document;
use App\Models\User;

class DemandeController
{
    private Demande $demandeModel;
    private Document $documentModel;
    private User $userModel;

    public function __construct()
    {
        $this->demandeModel = new Demande();
        $this->documentModel = new Document();
        $this->userModel = new User();
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
        if ($userRole !== 'admin' && $userRole !== 'dcuv' && $demande['user_id'] !== $userId) {
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
        if ($userRole === 'admin' || $userRole === 'dcuv') {
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
        if ($userRole !== 'admin' && $userRole !== 'dcuv' && $demande['user_id'] !== $userId) {
            return ['error' => 'Non autorisé'];
        }

        // Only allow updates on brouillon status for regular users
        if ($userRole !== 'admin' && $userRole !== 'dcuv' && $demande['statut'] !== 'brouillon') {
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

        try {
            $this->demandeModel->updateStatut($id, $statut, $instructeurId, $commentaire);
            $updatedDemande = $this->demandeModel->find($id);
            
            return [
                'success' => true,
                'message' => 'Statut mis à jour avec succès',
                'demande' => $updatedDemande
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la mise à jour du statut: ' . $e->getMessage()];
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
        if ($userRole !== 'admin' && $userRole !== 'dcuv' && $demande['user_id'] !== $userId) {
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

    public function getStats(): array
    {
        $stats = $this->demandeModel->getStats();
        
        return [
            'success' => true,
            'stats' => $stats
        ];
    }
}
