<?php

namespace App\Config;

class JWTConfig
{
    public static function getSecret(): string
    {
        return $_ENV['JWT_SECRET'] ?? 'change_this_secret_in_production';
    }

    public static function getExpiration(): int
    {
        return (int)($_ENV['JWT_EXPIRATION'] ?? 86400); // 24 hours default
    }

    public static function getAlgorithm(): string
    {
        return 'HS256';
    }
}
