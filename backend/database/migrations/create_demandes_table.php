<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS demandes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_suivi TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        type_local TEXT NOT NULL,
        motif TEXT NOT NULL,
        description TEXT,
        statut TEXT NOT NULL DEFAULT 'brouillon',
        date_soumission DATETIME,
        date_instruction DATETIME,
        date_decision DATETIME,
        instructeur_id INTEGER,
        commentaire_instruction TEXT,
        local_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id),
        FOREIGN KEY (instructeur_id) REFERENCES utilisateurs(id),
        FOREIGN KEY (local_id) REFERENCES locaux(id),
        CHECK(statut IN ('brouillon', 'soumis', 'en_instruction', 'recevable', 'incomplet', 'rejete', 'en_commission', 'attribue', 'non_attribue'))
    )";
    
    $db->exec($sql);
    
    // Create indexes
    $db->exec("CREATE INDEX IF NOT EXISTS idx_demandes_numero_suivi ON demandes(numero_suivi)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_demandes_user_id ON demandes(user_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_demandes_statut ON demandes(statut)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_demandes_instructeur ON demandes(instructeur_id)");
    
    echo "Migration demandes terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration demandes: " . $e->getMessage() . "\n";
    exit(1);
}
