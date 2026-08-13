<?php

namespace App\Models;

class Local extends Model
{
    protected string $table = 'locaux';

    public function findByReference(string $reference): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE reference = :reference LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['reference' => $reference]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findByType(string $type): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE type = :type ORDER BY reference";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['type' => $type]);
        return $stmt->fetchAll();
    }

    public function findByStatut(string $statut): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE statut = :statut ORDER BY reference";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['statut' => $statut]);
        return $stmt->fetchAll();
    }

    public function getAvailable(): array
    {
        return $this->findByStatut('disponible');
    }

    public function updateStatut(int $id, string $statut): bool
    {
        $validStatuts = ['disponible', 'occupe', 'en_maintenance', 'reserve', 'inactif'];
        
        if (!in_array($statut, $validStatuts)) {
            return false;
        }

        $sql = "UPDATE {$this->table} SET statut = :statut, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['statut' => $statut, 'id' => $id]);
    }

    public function findByZone(string $zone): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE zone = :zone ORDER BY reference";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['zone' => $zone]);
        return $stmt->fetchAll();
    }

    public function search(string $query): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE reference LIKE :query 
                OR type LIKE :query 
                OR usage LIKE :query 
                OR zone LIKE :query
                OR description LIKE :query
                ORDER BY reference";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['query' => "%{$query}%"]);
        return $stmt->fetchAll();
    }

    public function getStats(): array
    {
        $sql = "SELECT statut, COUNT(*) as count FROM {$this->table} GROUP BY statut";
        return $this->db->query($sql)->fetchAll();
    }

    public function getByUsage(string $usage): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE usage = :usage ORDER BY reference";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['usage' => $usage]);
        return $stmt->fetchAll();
    }
}
