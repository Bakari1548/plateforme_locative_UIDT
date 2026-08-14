<?php

namespace App\Controllers;

use App\Models\Notification;

class NotificationController
{
    private Notification $notificationModel;

    public function __construct()
    {
        $this->notificationModel = new Notification();
    }

    public function index(int $userId): array
    {
        $notifications = $this->notificationModel->findByUserId($userId);
        $unreadCount = $this->notificationModel->countUnread($userId);
        return [
            'success' => true,
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ];
    }

    public function getUnread(int $userId): array
    {
        $notifications = $this->notificationModel->getUnread($userId);
        return [
            'success' => true,
            'notifications' => $notifications,
            'count' => count($notifications)
        ];
    }

    public function markAsRead(int $id, int $userId): array
    {
        $notification = $this->notificationModel->find($id);
        if (!$notification) {
            return ['error' => 'Notification non trouvée'];
        }

        if ($notification['user_id'] !== $userId) {
            return ['error' => 'Non autorisé'];
        }

        $this->notificationModel->markAsRead($id);
        return ['success' => true, 'message' => 'Marquée comme lue'];
    }

    public function markAllAsRead(int $userId): array
    {
        $this->notificationModel->markAllAsRead($userId);
        return ['success' => true, 'message' => 'Toutes les notifications marquées comme lues'];
    }

    public function create(array $data): array
    {
        $required = ['user_id', 'type', 'titre', 'message'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['error' => "Le champ {$field} est requis"];
            }
        }

        $validTypes = ['demande', 'commission', 'decision', 'contrat', 'paiement',
                       'incident', 'intervention', 'sanction', 'controle_qhse', 'courrier', 'systeme'];
        if (!in_array($data['type'], $validTypes)) {
            return ['error' => 'Type de notification invalide'];
        }

        $id = $this->notificationModel->createForUser(
            (int)$data['user_id'],
            $data['type'],
            $data['titre'],
            $data['message'],
            $data['data'] ?? null
        );

        return ['success' => true, 'message' => 'Notification créée', 'id' => $id];
    }
}
