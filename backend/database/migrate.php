<?php

require_once __DIR__ . '/../config/database.php';

// Initialize database
App\Config\Database::init();

$migrationsDir = __DIR__ . '/migrations';
$migrationFiles = glob($migrationsDir . '/*.php');

// Sort migrations by filename
sort($migrationFiles);

echo "=== Exécution des migrations ===\n";

foreach ($migrationFiles as $file) {
    $filename = basename($file);
    echo "Exécution de $filename...\n";
    
    try {
        require_once $file;
        echo "✓ $filename terminée\n";
    } catch (Exception $e) {
        echo "✗ Erreur dans $filename: " . $e->getMessage() . "\n";
        exit(1);
    }
}

echo "\n=== Toutes les migrations terminées avec succès ===\n";
