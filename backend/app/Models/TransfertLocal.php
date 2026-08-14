<?php

namespace App\Models;

class TransfertLocal extends Model
{
    protected string $table = 'transferts_locaux';

    public function findByLocalId(int $localId): array
    {
        $sql = "SELECT t.*, l.reference as local_reference,
                u1.prenom as ancien_prenom, u1.nom as ancien_nom,
                u2.prenom as nouveau_prenom, u2.nom as nouveau_nom
                FROM {$this->table} t
                JOIN locaux l ON t.local_id = l.id
                LEFT JOIN utilisateurs u1 ON t.ancien_locataire_id = u1.id
                JOIN utilisateurs u2 ON t.nouveau_locataire_id = u2.id
                WHERE t.local_id = :local_id
                ORDER BY t.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['local_id' => $localId]);
        return $stmt->fetchAll();
    }

    public function getPending(): array
    {
        $sql = "SELECT t.*, l.reference as local_reference,
                u1.prenom as ancien_prenom, u1.nom as ancien_nom,
                u2.prenom as nouveau_prenom, u2.nom as nouveau_nom
                FROM {$this->table} t
                JOIN locaux l ON t.local_id = l.id
                LEFT JOIN utilisateurs u1 ON t.ancien_locataire_id = u1.id
                JOIN utilisateurs u2 ON t.nouveau_locataire_id = u2.id
                WHERE t.statut = 'en_attente'
                ORDER BY t.created_at DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getHistory(int $localId): array
    {
        return $this->findByLocalId($localId);
    }

    public function updateStatut(int $id, string $statut, int $validePar): bool
    {
        $validStatuts = ['valide', 'refuse'];
        if (!in_array($statut, $validStatuts)) {
            return false;
        }

        $sql = "UPDATE {$this->table} SET statut = :statut, valide_par = :valide_par WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['statut' => $statut, 'valide_par' => $validePar, 'id' => $id]);
    }
}
