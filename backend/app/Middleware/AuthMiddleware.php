<?php

namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Config\JWTConfig;

class AuthMiddleware extends Middleware
{
    private ?array $payload = null;

    public function handle(): bool
    {
        $authHeader = $this->getAuthHeader();

        if ($authHeader === null) {
            $this->sendJsonError(401, 'Token d\'authentification manquant');
        }

        $token = $this->extractToken($authHeader);

        if ($token === null) {
            $this->sendJsonError(401, 'Format de token invalide');
        }

        try {
            $this->payload = JWT::decode(
                $token,
                new Key(JWTConfig::getSecret(), JWTConfig::getAlgorithm())
            );
            return true;
        } catch (\Exception $e) {
            $this->sendJsonError(401, 'Token invalide ou expiré');
        }
    }

    public function getUserId(): ?int
    {
        return $this->payload['user_id'] ?? null;
    }

    public function getUserRole(): ?string
    {
        return $this->payload['role'] ?? null;
    }

    public function getPayload(): ?array
    {
        return $this->payload ? (array) $this->payload : null;
    }
}
