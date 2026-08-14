<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS echeances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contrat_id INTEGER NOT NULL,
        mois INTEGER NOT NULL,
        annee INTEGER NOT NULL,
        montant_prevu REAL NOT NULL,
        date_echeance DATE NOT NULL,
        statut TEXT NOT NULL DEFAULT 'a_venir',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (contrat_id) REFERENCES contrats(id) ON DELETE CASCADE,
        CHECK(statut IN ('a_venir', 'en_retard', 'paye', 'partiellement_paye')),
        UNIQUE(contrat_id, mois, annee)
    )";
    
    $db->exec($sql);
    
    $db->exec("CREATE INDEX IF NOT EXISTS idx_echeances_contrat ON echeances(contrat_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_echeances_statut ON echeances(statut)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_echeances_date ON echeances(date_echeance)");
    
    echo "Migration echeances terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration echeances: " . $e->getMessage() . "\n";
    exit(1);
}
