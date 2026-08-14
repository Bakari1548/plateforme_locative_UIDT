<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS commissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        demande_id INTEGER NOT NULL,
        date_commission DATETIME DEFAULT CURRENT_TIMESTAMP,
        lieu TEXT,
        statut TEXT NOT NULL DEFAULT 'planifiee',
        avis TEXT,
        avis_motive TEXT,
        recommandation TEXT,
        date_avis DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE,
        CHECK(statut IN ('planifiee', 'en_cours', 'avis_emis', 'cloturee'))
    )";
    
    $db->exec($sql);
    
    // Commission members table
    $sqlMembers = "CREATE TABLE IF NOT EXISTS commission_membres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        commission_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role_commission TEXT,
        present INTEGER DEFAULT 0,
        avis_particulier TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (commission_id) REFERENCES commissions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id),
        UNIQUE(commission_id, user_id)
    )";
    
    $db->exec($sqlMembers);
    
    // Create indexes
    $db->exec("CREATE INDEX IF NOT EXISTS idx_commissions_demande_id ON commissions(demande_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_commissions_statut ON commissions(statut)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_commission_membres_commission ON commission_membres(commission_id)");
    
    echo "Migration commissions terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration commissions: " . $e->getMessage() . "\n";
    exit(1);
}
