<?php

namespace App\Controllers;

use App\Models\User;
use Firebase\JWT\JWT;
use App\Config\JWTConfig;
use App\Config\Roles;

class AuthController
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    public function register(array $data): array
    {
        // Validate required fields
        $required = ['email', 'password', 'prenom', 'nom'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['error' => "Le champ {$field} est requis"];
            }
        }

        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return ['error' => 'Format d\'email invalide'];
        }

        // Validate password strength
        if (strlen($data['password']) < 8) {
            return ['error' => 'Le mot de passe doit contenir au moins 8 caractères'];
        }

        // Check if email already exists
        if ($this->userModel->findByEmail($data['email'])) {
            return ['error' => 'Cet email est déjà utilisé'];
        }

        // Check if CNI already exists (if provided)
        if (!empty($data['numero_cni']) && $this->userModel->findByCNI($data['numero_cni'])) {
            return ['error' => 'Ce numéro CNI est déjà utilisé'];
        }

        // Set default role if not provided
        if (empty($data['role'])) {
            $data['role'] = Roles::VISITEUR;
        }

        // Validate role
        if (!in_array($data['role'], Roles::getAllRoles())) {
            return ['error' => 'Rôle invalide'];
        }

        try {
            $userId = $this->userModel->create($data);
            $user = $this->userModel->find($userId);
            
            // Remove password hash from response
            unset($user['password_hash']);
            
            return [
                'success' => true,
                'message' => 'Inscription réussie',
                'user' => $user
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de l\'inscription: ' . $e->getMessage()];
        }
    }

    public function login(array $data): array
    {
        // Validate required fields
        if (empty($data['email']) || empty($data['password'])) {
            return ['error' => 'Email et mot de passe requis'];
        }

        // Find user by email
        $user = $this->userModel->findByEmail($data['email']);
        
        if (!$user) {
            return ['error' => 'Identifiants invalides'];
        }

        // Check account status
        if ($user['statut'] !== 'actif') {
            return ['error' => 'Ce compte est ' . $user['statut']];
        }

        // Verify password
        if (!$this->userModel->verifyPassword($data['password'], $user['password_hash'])) {
            return ['error' => 'Identifiants invalides'];
        }

        // Update last login
        $this->userModel->updateLastLogin($user['id']);

        // Generate JWT token
        $payload = [
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'iat' => time(),
            'exp' => time() + JWTConfig::getExpiration()
        ];

        $token = JWT::encode($payload, JWTConfig::getSecret(), JWTConfig::getAlgorithm());

        // Remove password hash from response
        unset($user['password_hash']);

        return [
            'success' => true,
            'message' => 'Connexion réussie',
            'token' => $token,
            'user' => $user
        ];
    }

    public function me(int $userId): array
    {
        $user = $this->userModel->find($userId);
        
        if (!$user) {
            return ['error' => 'Utilisateur non trouvé'];
        }

        // Remove password hash from response
        unset($user['password_hash']);

        return [
            'success' => true,
            'user' => $user
        ];
    }
}
