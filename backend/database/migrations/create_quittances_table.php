<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS quittances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paiement_id INTEGER NOT NULL,
        reference TEXT UNIQUE NOT NULL,
        date_emission DATETIME DEFAULT CURRENT_TIMESTAMP,
        montant TEXT NOT NULL,
        periode TEXT NOT NULL,
        fichier_pdf TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (paiement_id) REFERENCES paiements(id) ON DELETE CASCADE
    )";
    
    $db->exec($sql);
    
    $db->exec("CREATE INDEX IF NOT EXISTS idx_quittances_paiement ON quittances(paiement_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_quittances_reference ON quittances(reference)");
    
    echo "Migration quittances terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration quittances: " . $e->getMessage() . "\n";
    exit(1);
}
