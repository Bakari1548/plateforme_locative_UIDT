<?php

namespace App\Models;

class Incident extends Model
{
    protected string $table = 'incidents';

    public function generateReference(): string
    {
        $year = date('Y');
        $count = $this->count() + 1;
        return sprintf('INC-%s-%04d', $year, $count);
    }

    public function findByLocataireId(int $locataireId): array
    {
        $sql = "SELECT i.*, l.reference as local_reference
                FROM {$this->table} i
                LEFT JOIN locaux l ON i.local_id = l.id
                WHERE i.locataire_id = :locataire_id
                ORDER BY i.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['locataire_id' => $locataireId]);
        return $stmt->fetchAll();
    }

    public function findByTechnicienId(int $technicienId): array
    {
        $sql = "SELECT i.*, u.prenom, u.nom, l.reference as local_reference
                FROM {$this->table} i
                JOIN utilisateurs u ON i.locataire_id = u.id
                LEFT JOIN locaux l ON i.local_id = l.id
                WHERE i.technicien_id = :technicien_id
                ORDER BY i.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['technicien_id' => $technicienId]);
        return $stmt->fetchAll();
    }

    public function getPending(): array
    {
        $sql = "SELECT i.*, u.prenom, u.nom, l.reference as local_reference
                FROM {$this->table} i
                JOIN utilisateurs u ON i.locataire_id = u.id
                LEFT JOIN locaux l ON i.local_id = l.id
                WHERE i.statut IN ('signale', 'en_attente')
                ORDER BY 
                    CASE i.urgence 
                        WHEN 'critique' THEN 1 
                        WHEN 'urgent' THEN 2 
                        WHEN 'normal' THEN 3 
                        WHEN 'faible' THEN 4 
                    END,
                    i.created_at ASC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getWithDetails(int $id): ?array
    {
        $sql = "SELECT i.*, 
                u.prenom as locataire_prenom, u.nom as locataire_nom, u.email, u.telephone,
                l.reference as local_reference, l.type as local_type, l.zone,
                t.prenom as technicien_prenom, t.nom as technicien_nom,
                v.prenom as valideur_prenom, v.nom as valideur_nom
                FROM {$this->table} i
                JOIN utilisateurs u ON i.locataire_id = u.id
                LEFT JOIN locaux l ON i.local_id = l.id
                LEFT JOIN utilisateurs t ON i.technicien_id = t.id
                LEFT JOIN utilisateurs v ON i.valide_par = v.id
                WHERE i.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function assignTechnicien(int $id, int $technicienId): bool
    {
        $sql = "UPDATE {$this->table} 
                SET technicien_id = :technicien_id, statut = 'pris_en_charge',
                    date_prise_en_charge = CURRENT_TIMESTAMP
                WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['technicien_id' => $technicienId, 'id' => $id]);
    }

    public function validate(int $id, int $validePar, bool $priseEnChargeCrous, ?string $commentaire): bool
    {
        $sql = "UPDATE {$this->table} 
                SET valide_par = :valide_par, prise_en_charge_crous = :prise_en_charge,
                    commentaire_validation = :commentaire, statut = 'en_attente'
                WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'valide_par' => $validePar,
            'prise_en_charge' => $priseEnChargeCrous ? 1 : 0,
            'commentaire' => $commentaire,
            'id' => $id
        ]);
    }

    public function updateStatut(int $id, string $statut): bool
    {
        $validStatuts = ['signale', 'en_attente', 'pris_en_charge', 'en_cours', 'resolu', 'cloture', 'rejete'];
        if (!in_array($statut, $validStatuts)) {
            return false;
        }

        $dateCloture = in_array($statut, ['resolu', 'cloture']) ? ', date_cloture = CURRENT_TIMESTAMP' : '';

        $sql = "UPDATE {$this->table} SET statut = :statut{$dateCloture} WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['statut' => $statut, 'id' => $id]);
    }

    public function getStats(): array
    {
        $sql = "SELECT statut, COUNT(*) as count FROM {$this->table} GROUP BY statut";
        return $this->db->query($sql)->fetchAll();
    }

    public function getByStatut(string $statut): array
    {
        $sql = "SELECT i.*, u.prenom, u.nom, l.reference as local_reference
                FROM {$this->table} i
                JOIN utilisateurs u ON i.locataire_id = u.id
                LEFT JOIN locaux l ON i.local_id = l.id
                WHERE i.statut = :statut
                ORDER BY i.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['statut' => $statut]);
        return $stmt->fetchAll();
    }
}
