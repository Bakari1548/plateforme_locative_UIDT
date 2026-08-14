<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS decisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        demande_id INTEGER NOT NULL,
        commission_id INTEGER,
        directeur_id INTEGER NOT NULL,
        decision TEXT NOT NULL,
        motif TEXT,
        conditions TEXT,
        date_decision DATETIME DEFAULT CURRENT_TIMESTAMP,
        statut TEXT NOT NULL DEFAULT 'en_attente',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE,
        FOREIGN KEY (commission_id) REFERENCES commissions(id),
        FOREIGN KEY (directeur_id) REFERENCES utilisateurs(id),
        CHECK(decision IN ('attribue', 'non_attribue', 'reserve')),
        CHECK(statut IN ('en_attente', 'validee', 'notifiee'))
    )";
    
    $db->exec($sql);
    
    // Create indexes
    $db->exec("CREATE INDEX IF NOT EXISTS idx_decisions_demande_id ON decisions(demande_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_decisions_directeur ON decisions(directeur_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_decisions_statut ON decisions(statut)");
    
    echo "Migration decisions terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration decisions: " . $e->getMessage() . "\n";
    exit(1);
}
