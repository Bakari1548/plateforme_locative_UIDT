<?php

namespace App\Models;

use App\Config\Database;

class User extends Model
{
    protected string $table = 'utilisateurs';

    public function findByEmail(string $email): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE email = :email LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['email' => $email]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findByCNI(string $cni): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE numero_cni = :cni LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['cni' => $cni]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(array $data): int
    {
        // Hash password if provided
        if (isset($data['password'])) {
            $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
            unset($data['password']);
        }

        return parent::create($data);
    }

    public function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    public function updateLastLogin(int $userId): bool
    {
        $sql = "UPDATE {$this->table} SET updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $userId]);
    }

    public function getByRole(string $role): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE role = :role AND statut = 'actif'";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['role' => $role]);
        return $stmt->fetchAll();
    }

    public function updateStatus(int $userId, string $status): bool
    {
        $sql = "UPDATE {$this->table} SET statut = :statut, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['statut' => $status, 'id' => $userId]);
    }

    public function updateRole(int $userId, string $role): bool
    {
        $sql = "UPDATE {$this->table} SET role = :role, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['role' => $role, 'id' => $userId]);
    }

    public function getActiveUsers(): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE statut = 'actif' ORDER BY created_at DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function search(string $query): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE (prenom LIKE :query OR nom LIKE :query OR email LIKE :query OR telephone LIKE :query)
                ORDER BY nom, prenom";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['query' => "%{$query}%"]);
        return $stmt->fetchAll();
    }
}
