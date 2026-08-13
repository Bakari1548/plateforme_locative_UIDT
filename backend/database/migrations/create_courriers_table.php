<?php

require_once __DIR__ . '/../config/database.php';

try {
    $db = App\Config\Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS courriers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        demande_id INTEGER,
        destinataire_id INTEGER NOT NULL,
        expediteur_id INTEGER NOT NULL,
        type_courrier TEXT NOT NULL,
        objet TEXT NOT NULL,
        contenu TEXT,
        date_envoi DATETIME,
        date_reception DATETIME,
        statut TEXT NOT NULL DEFAULT 'en_attente',
        reference TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE SET NULL,
        FOREIGN KEY (destinataire_id) REFERENCES utilisateurs(id),
        FOREIGN KEY (expediteur_id) REFERENCES utilisateurs(id),
        CHECK(type_courrier IN ('demande_complements', 'notification_instruction', 'invitation_commission', 'notification_decision', 'relance', 'autre')),
        CHECK(statut IN ('en_attente', 'envoye', 'recu', 'lu'))
    )";
    
    $db->exec($sql);
    
    // Create indexes
    $db->exec("CREATE INDEX IF NOT EXISTS idx_courriers_demande_id ON courriers(demande_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_courriers_destinataire ON courriers(destinataire_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_courriers_expediteur ON courriers(expediteur_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_courriers_statut ON courriers(statut)");
    
    echo "Migration courriers terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration courriers: " . $e->getMessage() . "\n";
    exit(1);
}
