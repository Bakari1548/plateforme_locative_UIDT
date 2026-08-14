<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        titre TEXT NOT NULL,
        message TEXT NOT NULL,
        data TEXT,
        lu INTEGER DEFAULT 0,
        date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_lecture DATETIME,
        
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
        CHECK(type IN ('demande', 'commission', 'decision', 'contrat', 'paiement', 
              'incident', 'intervention', 'sanction', 'controle_qhse', 'courrier', 'systeme'))
    )";
    
    $db->exec($sql);
    
    $db->exec("CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_notifications_lu ON notifications(lu)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type)");
    
    echo "Migration notifications terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration notifications: " . $e->getMessage() . "\n";
    exit(1);
}
