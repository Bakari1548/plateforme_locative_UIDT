<?php

namespace App\Config;

class EmailConfig
{
    public static function getHost(): string
    {
        return $_ENV['SMTP_HOST'] ?? 'localhost';
    }

    public static function getPort(): int
    {
        return (int)($_ENV['SMTP_PORT'] ?? 587);
    }

    public static function getUsername(): string
    {
        return $_ENV['SMTP_USERNAME'] ?? '';
    }

    public static function getPassword(): string
    {
        return $_ENV['SMTP_PASSWORD'] ?? '';
    }

    public static function getEncryption(): string
    {
        return $_ENV['SMTP_ENCRYPTION'] ?? 'tls';
    }

    public static function getFrom(): string
    {
        return $_ENV['SMTP_FROM'] ?? 'noreply@croust.tg';
    }

    public static function getFromName(): string
    {
        return 'CROUS-T - Plateforme Locative';
    }
}
