<?php

namespace App\Models;

class Notification extends Model
{
    protected string $table = 'notifications';

    public function findByUserId(int $userId, int $limit = 50): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE user_id = :user_id ORDER BY date_creation DESC LIMIT :limit";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':user_id', $userId, \PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getUnread(int $userId): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE user_id = :user_id AND lu = 0 ORDER BY date_creation DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function countUnread(int $userId): int
    {
        $sql = "SELECT COUNT(*) as count FROM {$this->table} WHERE user_id = :user_id AND lu = 0";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        $result = $stmt->fetch();
        return (int)$result['count'];
    }

    public function markAsRead(int $id): bool
    {
        $sql = "UPDATE {$this->table} SET lu = 1, date_lecture = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    public function markAllAsRead(int $userId): bool
    {
        $sql = "UPDATE {$this->table} SET lu = 1, date_lecture = CURRENT_TIMESTAMP WHERE user_id = :user_id AND lu = 0";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['user_id' => $userId]);
    }

    public function createForUser(int $userId, string $type, string $titre, string $message, ?array $data = null): int
    {
        $sql = "INSERT INTO {$this->table} (user_id, type, titre, message, data) 
                VALUES (:user_id, :type, :titre, :message, :data)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'user_id' => $userId,
            'type' => $type,
            'titre' => $titre,
            'message' => $message,
            'data' => $data ? json_encode($data) : null
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function createForRole(string $role, string $type, string $titre, string $message, ?array $data = null): int
    {
        $sql = "SELECT id FROM utilisateurs WHERE role = :role AND statut = 'actif'";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['role' => $role]);
        $users = $stmt->fetchAll();

        $count = 0;
        foreach ($users as $user) {
            $this->createForUser($user['id'], $type, $titre, $message, $data);
            $count++;
        }
        return $count;
    }

    public function deleteOld(int $days = 30): int
    {
        $sql = "DELETE FROM {$this->table} WHERE date_creation < date('now', '-{$days} days') AND lu = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->rowCount();
    }
}
