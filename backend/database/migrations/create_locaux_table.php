<?php

require_once __DIR__ . '/../config/database.php';

try {
    $db = App\Config\Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS locaux (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        usage TEXT NOT NULL,
        statut TEXT NOT NULL DEFAULT 'disponible',
        zone TEXT,
        surface REAL,
        description TEXT,
        capacite INTEGER,
        loyer_mensuel REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        CHECK(type IN ('cantine', 'boutique', 'kiosque', 'bureau', 'autre')),
        CHECK(statut IN ('disponible', 'occupe', 'en_maintenance', 'reserve', 'inactif'))
    )";
    
    $db->exec($sql);
    
    // Create indexes
    $db->exec("CREATE INDEX IF NOT EXISTS idx_locaux_reference ON locaux(reference)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_locaux_type ON locaux(type)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_locaux_statut ON locaux(statut)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_locaux_zone ON locaux(zone)");
    
    echo "Migration locaux terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration locaux: " . $e->getMessage() . "\n";
    exit(1);
}
