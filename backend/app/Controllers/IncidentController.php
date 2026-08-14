<?php

namespace App\Controllers;

use App\Models\Incident;
use App\Models\Intervention;

class IncidentController
{
    private Incident $incidentModel;
    private Intervention $interventionModel;

    public function __construct()
    {
        $this->incidentModel = new Incident();
        $this->interventionModel = new Intervention();
    }

    public function create(int $locataireId, array $data): array
    {
        $required = ['type_incident', 'description'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['error' => "Le champ {$field} est requis"];
            }
        }

        $validTypes = ['plomberie', 'electricite', 'structure', 'securite', 'nettoyage', 'autre'];
        if (!in_array($data['type_incident'], $validTypes)) {
            return ['error' => 'Type d\'incident invalide'];
        }

        $urgence = $data['urgence'] ?? 'normal';
        $validUrgences = ['faible', 'normal', 'urgent', 'critique'];
        if (!in_array($urgence, $validUrgences)) {
            return ['error' => 'Niveau d\'urgence invalide'];
        }

        $reference = $this->incidentModel->generateReference();

        $incidentData = [
            'reference' => $reference,
            'locataire_id' => $locataireId,
            'local_id' => $data['local_id'] ?? null,
            'contrat_id' => $data['contrat_id'] ?? null,
            'type_incident' => $data['type_incident'],
            'description' => $data['description'],
            'urgence' => $urgence,
            'photo_url' => $data['photo_url'] ?? null,
            'statut' => 'signale'
        ];

        try {
            $id = $this->incidentModel->create($incidentData);
            $incident = $this->incidentModel->getWithDetails($id);
            return ['success' => true, 'message' => 'Incident signalé', 'incident' => $incident];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function show(int $id): array
    {
        $incident = $this->incidentModel->getWithDetails($id);
        if (!$incident) {
            return ['error' => 'Incident non trouvé'];
        }
        $interventions = $this->interventionModel->findByIncidentId($id);
        $incident['interventions'] = $interventions;
        return ['success' => true, 'incident' => $incident];
    }

    public function index(int $userId, string $userRole): array
    {
        if (in_array($userRole, ['admin', 'dcuv'])) {
            $incidents = $this->incidentModel->all();
        } elseif ($userRole === 'technicien') {
            $incidents = $this->incidentModel->findByTechnicienId($userId);
        } else {
            $incidents = $this->incidentModel->findByLocataireId($userId);
        }
        return ['success' => true, 'incidents' => $incidents, 'count' => count($incidents)];
    }

    public function getPending(): array
    {
        $incidents = $this->incidentModel->getPending();
        return ['success' => true, 'incidents' => $incidents, 'count' => count($incidents)];
    }

    public function validate(int $id, int $validePar, array $data): array
    {
        $incident = $this->incidentModel->find($id);
        if (!$incident) {
            return ['error' => 'Incident non trouvé'];
        }

        if ($incident['statut'] !== 'signale') {
            return ['error' => 'Incident déjà traité'];
        }

        try {
            $this->incidentModel->validate(
                $id, $validePar,
                !empty($data['prise_en_charge_crous']),
                $data['commentaire'] ?? null
            );

            if (!empty($data['technicien_id'])) {
                $this->incidentModel->assignTechnicien($id, (int)$data['technicien_id']);
            }

            $updated = $this->incidentModel->getWithDetails($id);
            return ['success' => true, 'message' => 'Incident validé', 'incident' => $updated];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function assignTechnicien(int $id, int $technicienId): array
    {
        $incident = $this->incidentModel->find($id);
        if (!$incident) {
            return ['error' => 'Incident non trouvé'];
        }

        try {
            $this->incidentModel->assignTechnicien($id, $technicienId);
            $updated = $this->incidentModel->getWithDetails($id);
            return ['success' => true, 'message' => 'Technicien assigné', 'incident' => $updated];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function updateStatut(int $id, string $statut): array
    {
        $incident = $this->incidentModel->find($id);
        if (!$incident) {
            return ['error' => 'Incident non trouvé'];
        }

        try {
            $this->incidentModel->updateStatut($id, $statut);
            $updated = $this->incidentModel->find($id);
            return ['success' => true, 'message' => 'Statut mis à jour', 'incident' => $updated];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function getStats(): array
    {
        $stats = $this->incidentModel->getStats();
        return ['success' => true, 'stats' => $stats];
    }

    // Interventions
    public function createIntervention(int $incidentId, int $technicienId, array $data): array
    {
        $incident = $this->incidentModel->find($incidentId);
        if (!$incident) {
            return ['error' => 'Incident non trouvé'];
        }

        try {
            $interventionData = array_merge($data, [
                'incident_id' => $incidentId,
                'technicien_id' => $technicienId,
                'statut' => 'planifiee'
            ]);
            $id = $this->interventionModel->create($interventionData);

            // Update incident status to en_cours
            $this->incidentModel->updateStatut($incidentId, 'en_cours');

            $intervention = $this->interventionModel->getWithDetails($id);
            return ['success' => true, 'message' => 'Intervention créée', 'intervention' => $intervention];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function completeIntervention(int $id, array $data): array
    {
        $intervention = $this->interventionModel->find($id);
        if (!$intervention) {
            return ['error' => 'Intervention non trouvée'];
        }

        try {
            $this->interventionModel->complete($id, $data);

            // Mark incident as resolved
            $this->incidentModel->updateStatut($intervention['incident_id'], 'resolu');

            $updated = $this->interventionModel->getWithDetails($id);
            return ['success' => true, 'message' => 'Intervention terminée', 'intervention' => $updated];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    public function getInterventionsByIncident(int $incidentId): array
    {
        $interventions = $this->interventionModel->findByIncidentId($incidentId);
        return ['success' => true, 'interventions' => $interventions, 'count' => count($interventions)];
    }

    public function getMyInterventions(int $technicienId): array
    {
        $interventions = $this->interventionModel->findByTechnicienId($technicienId);
        return ['success' => true, 'interventions' => $interventions, 'count' => count($interventions)];
    }

    public function getAllInterventions(): array
    {
        $interventions = $this->interventionModel->getAllInterventions();
        return ['success' => true, 'interventions' => $interventions, 'count' => count($interventions)];
    }
}
