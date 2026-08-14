<?php

namespace App\Models;

class Decision extends Model
{
    protected string $table = 'decisions';

    public function findByDemandeId(int $demandeId): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE demande_id = :demande_id ORDER BY created_at DESC LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['demande_id' => $demandeId]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function getWithDetails(int $id): ?array
    {
        $sql = "SELECT dec.*, d.numero_suivi, d.type_local, d.motif,
                u.prenom as locataire_prenom, u.nom as locataire_nom,
                dir.prenom as directeur_prenom, dir.nom as directeur_nom,
                c.avis, c.avis_motive, c.recommandation
                FROM {$this->table} dec
                JOIN demandes d ON dec.demande_id = d.id
                JOIN utilisateurs u ON d.user_id = u.id
                JOIN utilisateurs dir ON dec.directeur_id = dir.id
                LEFT JOIN commissions c ON dec.commission_id = c.id
                WHERE dec.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function getPendingValidation(): array
    {
        $sql = "SELECT dec.*, d.numero_suivi, d.type_local, d.motif,
                u.prenom, u.nom, c.avis, c.recommandation
                FROM {$this->table} dec
                JOIN demandes d ON dec.demande_id = d.id
                JOIN utilisateurs u ON d.user_id = u.id
                LEFT JOIN commissions c ON dec.commission_id = c.id
                WHERE dec.statut = 'en_attente'
                ORDER BY dec.created_at ASC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getValidated(): array
    {
        $sql = "SELECT dec.*, d.numero_suivi, d.type_local,
                u.prenom, u.nom
                FROM {$this->table} dec
                JOIN demandes d ON dec.demande_id = d.id
                JOIN utilisateurs u ON d.user_id = u.id
                WHERE dec.statut IN ('validee', 'notifiee')
                ORDER BY dec.date_decision DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function validate(int $id): bool
    {
        $sql = "UPDATE {$this->table} SET statut = 'validee', date_decision = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    public function markNotified(int $id): bool
    {
        $sql = "UPDATE {$this->table} SET statut = 'notifiee' WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }
}
