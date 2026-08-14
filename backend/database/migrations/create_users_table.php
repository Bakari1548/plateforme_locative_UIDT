<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS utilisateurs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prenom TEXT NOT NULL,
        nom TEXT NOT NULL,
        profession TEXT,
        numero_cni TEXT UNIQUE,
        telephone TEXT,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL DEFAULT 'visiteur',
        statut TEXT NOT NULL DEFAULT 'actif',
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        CHECK(role IN ('visiteur', 'locataire', 'dcuv', 'directeur', 'technicien', 'agentRecouv', 'agentCourrier', 'secretaireCSA', 'admin')),
        CHECK(statut IN ('actif', 'inactif', 'suspendu'))
    )";
    
    $db->exec($sql);
    
    // Create index on email for faster lookups
    $db->exec("CREATE INDEX IF NOT EXISTS idx_users_email ON utilisateurs(email)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_users_role ON utilisateurs(role)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_users_statut ON utilisateurs(statut)");
    
    echo "Migration utilisateurs terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration utilisateurs: " . $e->getMessage() . "\n";
    exit(1);
}
