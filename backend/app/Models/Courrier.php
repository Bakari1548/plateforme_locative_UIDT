<?php

namespace App\Models;

class Courrier extends Model
{
    protected string $table = 'courriers';

    public function findByDemandeId(int $demandeId): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE demande_id = :demande_id ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['demande_id' => $demandeId]);
        return $stmt->fetchAll();
    }

    public function findByDestinataire(int $destinataireId): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE destinataire_id = :destinataire_id ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['destinataire_id' => $destinataireId]);
        return $stmt->fetchAll();
    }

    public function findByExpediteur(int $expediteurId): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE expediteur_id = :expediteur_id ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['expediteur_id' => $expediteurId]);
        return $stmt->fetchAll();
    }

    public function generateReference(): string
    {
        $year = date('Y');
        $month = date('m');
        $count = $this->count() + 1;
        return sprintf('CRO-%s%s-%04d', $year, $month, $count);
    }

    public function updateStatut(int $id, string $statut): bool
    {
        $validStatuts = ['en_attente', 'envoye', 'recu', 'lu'];
        
        if (!in_array($statut, $validStatuts)) {
            return false;
        }

        if ($statut === 'envoye') {
            $sql = "UPDATE {$this->table} SET statut = :statut, date_envoi = CURRENT_TIMESTAMP WHERE id = :id";
        } elseif ($statut === 'recu') {
            $sql = "UPDATE {$this->table} SET statut = :statut, date_reception = CURRENT_TIMESTAMP WHERE id = :id";
        } else {
            $sql = "UPDATE {$this->table} SET statut = :statut WHERE id = :id";
        }

        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['statut' => $statut, 'id' => $id]);
    }

    public function markAsLu(int $id): bool
    {
        return $this->updateStatut($id, 'lu');
    }

    public function getUnreadForUser(int $userId): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE destinataire_id = :user_id AND statut IN ('envoye', 'recu') ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function getByType(string $type): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE type_courrier = :type_courrier ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['type_courrier' => $type]);
        return $stmt->fetchAll();
    }
}
