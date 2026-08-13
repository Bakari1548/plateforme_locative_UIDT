<?php

namespace App\Middleware;

abstract class Middleware
{
    abstract public function handle(): bool;

    protected function sendJsonError(int $code, string $message): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode(['error' => $message]);
        exit;
    }

    protected function getAuthHeader(): ?string
    {
        $headers = getallheaders();
        return $headers['Authorization'] ?? $headers['authorization'] ?? null;
    }

    protected function extractToken(string $authHeader): ?string
    {
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
        return null;
    }
}
