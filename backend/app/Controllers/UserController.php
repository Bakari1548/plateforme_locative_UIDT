<?php

namespace App\Controllers;

use App\Models\User;
use App\Config\Roles;

class UserController
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    public function index(): array
    {
        try {
            $users = $this->userModel->all();
            
            // Remove password hashes from response
            foreach ($users as &$user) {
                unset($user['password_hash']);
            }
            
            return [
                'success' => true,
                'users' => $users,
                'count' => count($users)
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la récupération des utilisateurs: ' . $e->getMessage()];
        }
    }

    public function show(int $id): array
    {
        $user = $this->userModel->find($id);
        
        if (!$user) {
            return ['error' => 'Utilisateur non trouvé'];
        }

        unset($user['password_hash']);

        return [
            'success' => true,
            'user' => $user
        ];
    }

    public function update(int $id, array $data): array
    {
        $user = $this->userModel->find($id);
        
        if (!$user) {
            return ['error' => 'Utilisateur non trouvé'];
        }

        // Don't allow updating email to an existing one
        if (!empty($data['email']) && $data['email'] !== $user['email']) {
            $existing = $this->userModel->findByEmail($data['email']);
            if ($existing) {
                return ['error' => 'Cet email est déjà utilisé'];
            }
        }

        // Don't allow updating CNI to an existing one
        if (!empty($data['numero_cni']) && $data['numero_cni'] !== $user['numero_cni']) {
            $existing = $this->userModel->findByCNI($data['numero_cni']);
            if ($existing) {
                return ['error' => 'Ce numéro CNI est déjà utilisé'];
            }
        }

        // Validate role if provided
        if (!empty($data['role']) && !in_array($data['role'], Roles::getAllRoles())) {
            return ['error' => 'Rôle invalide'];
        }

        // Validate status if provided
        if (!empty($data['statut']) && !in_array($data['statut'], ['actif', 'inactif', 'suspendu'])) {
            return ['error' => 'Statut invalide'];
        }

        // Hash password if provided
        if (!empty($data['password'])) {
            $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
            unset($data['password']);
        }

        try {
            $this->userModel->update($id, $data);
            $updatedUser = $this->userModel->find($id);
            unset($updatedUser['password_hash']);
            
            return [
                'success' => true,
                'message' => 'Utilisateur mis à jour avec succès',
                'user' => $updatedUser
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la mise à jour: ' . $e->getMessage()];
        }
    }

    public function delete(int $id): array
    {
        $user = $this->userModel->find($id);
        
        if (!$user) {
            return ['error' => 'Utilisateur non trouvé'];
        }

        try {
            $this->userModel->delete($id);
            
            return [
                'success' => true,
                'message' => 'Utilisateur supprimé avec succès'
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la suppression: ' . $e->getMessage()];
        }
    }

    public function updateStatus(int $id, string $status): array
    {
        if (!in_array($status, ['actif', 'inactif', 'suspendu'])) {
            return ['error' => 'Statut invalide'];
        }

        $user = $this->userModel->find($id);
        
        if (!$user) {
            return ['error' => 'Utilisateur non trouvé'];
        }

        try {
            $this->userModel->updateStatus($id, $status);
            
            return [
                'success' => true,
                'message' => 'Statut mis à jour avec succès'
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la mise à jour du statut: ' . $e->getMessage()];
        }
    }

    public function updateRole(int $id, string $role): array
    {
        if (!in_array($role, Roles::getAllRoles())) {
            return ['error' => 'Rôle invalide'];
        }

        $user = $this->userModel->find($id);
        
        if (!$user) {
            return ['error' => 'Utilisateur non trouvé'];
        }

        try {
            $this->userModel->updateRole($id, $role);
            
            return [
                'success' => true,
                'message' => 'Rôle mis à jour avec succès'
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la mise à jour du rôle: ' . $e->getMessage()];
        }
    }

    public function search(string $query): array
    {
        try {
            $users = $this->userModel->search($query);
            
            // Remove password hashes from response
            foreach ($users as &$user) {
                unset($user['password_hash']);
            }
            
            return [
                'success' => true,
                'users' => $users,
                'count' => count($users)
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la recherche: ' . $e->getMessage()];
        }
    }

    public function getByRole(string $role): array
    {
        if (!in_array($role, Roles::getAllRoles())) {
            return ['error' => 'Rôle invalide'];
        }

        try {
            $users = $this->userModel->getByRole($role);
            
            // Remove password hashes from response
            foreach ($users as &$user) {
                unset($user['password_hash']);
            }
            
            return [
                'success' => true,
                'users' => $users,
                'count' => count($users)
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la récupération: ' . $e->getMessage()];
        }
    }
}
