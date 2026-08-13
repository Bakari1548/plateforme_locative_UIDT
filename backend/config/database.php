<?php

namespace App\Config;

class Database
{
    private static ?\PDO $instance = null;
    private static string $dbPath;

    public static function init(string $dbPath = null): void
    {
        self::$dbPath = $dbPath ?? ($_ENV['DB_PATH'] ?? __DIR__ . '/../database/croust.db');
    }

    public static function getInstance(): \PDO
    {
        if (self::$instance === null) {
            if (!isset(self::$dbPath)) {
                self::init();
            }

            $dsn = 'sqlite:' . self::$dbPath;
            
            self::$instance = new \PDO($dsn);
            self::$instance->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
            self::$instance->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
            self::$instance->setAttribute(\PDO::ATTR_EMULATE_PREPARES, false);
        }

        return self::$instance;
    }

    public static function getDbPath(): string
    {
        if (!isset(self::$dbPath)) {
            self::init();
        }
        return self::$dbPath;
    }

    public static function reset(): void
    {
        self::$instance = null;
    }
}
