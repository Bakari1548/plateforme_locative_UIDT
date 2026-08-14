<?php

namespace App\Models;

class Intervention extends Model
{
    protected string $table = 'interventions';

    public function findByIncidentId(int $incidentId): array
    {
        $sql = "SELECT int.*, t.prenom, t.nom
                FROM {$this->table} int
                JOIN utilisateurs t ON int.technicien_id = t.id
                WHERE int.incident_id = :incident_id
                ORDER BY int.date_intervention DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['incident_id' => $incidentId]);
        return $stmt->fetchAll();
    }

    public function findByTechnicienId(int $technicienId): array
    {
        $sql = "SELECT int.*, i.reference as incident_reference, i.type_incident, i.description
                FROM {$this->table} int
                JOIN incidents i ON int.incident_id = i.id
                WHERE int.technicien_id = :technicien_id
                ORDER BY int.date_intervention DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['technicien_id' => $technicienId]);
        return $stmt->fetchAll();
    }

    public function getWithDetails(int $id): ?array
    {
        $sql = "SELECT int.*, i.reference as incident_reference, i.type_incident,
                t.prenom as technicien_prenom, t.nom as technicien_nom
                FROM {$this->table} int
                JOIN incidents i ON int.incident_id = i.id
                JOIN utilisateurs t ON int.technicien_id = t.id
                WHERE int.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function updateStatut(int $id, string $statut): bool
    {
        $validStatuts = ['planifiee', 'en_cours', 'terminee', 'annulee'];
        if (!in_array($statut, $validStatuts)) {
            return false;
        }

        $sql = "UPDATE {$this->table} SET statut = :statut WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['statut' => $statut, 'id' => $id]);
    }

    public function complete(int $id, array $data): bool
    {
        $sql = "UPDATE {$this->table} 
                SET diagnostic = :diagnostic, action_realisee = :action_realisee,
                    pieces_utilisees = :pieces_utilisees, duree_minutes = :duree_minutes,
                    resultat = :resultat, statut = 'terminee'
                WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'diagnostic' => $data['diagnostic'] ?? null,
            'action_realisee' => $data['action_realisee'] ?? null,
            'pieces_utilisees' => $data['pieces_utilisees'] ?? null,
            'duree_minutes' => $data['duree_minutes'] ?? null,
            'resultat' => $data['resultat'] ?? null,
            'id' => $id
        ]);
    }

    public function getAllInterventions(): array
    {
        $sql = "SELECT int.*, i.reference as incident_reference, i.type_incident,
                i.description as incident_description, i.urgence,
                t.prenom as technicien_prenom, t.nom as technicien_nom,
                l.prenom as locataire_prenom, l.nom as locataire_nom,
                loc.reference as local_reference
                FROM {$this->table} int
                JOIN incidents i ON int.incident_id = i.id
                JOIN utilisateurs t ON int.technicien_id = t.id
                JOIN utilisateurs l ON i.locataire_id = l.id
                LEFT JOIN locaux loc ON i.local_id = loc.id
                ORDER BY int.date_intervention DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getHistoryByIncident(int $incidentId): array
    {
        return $this->findByIncidentId($incidentId);
    }
}
