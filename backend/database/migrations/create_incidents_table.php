<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT UNIQUE NOT NULL,
        locataire_id INTEGER NOT NULL,
        local_id INTEGER,
        contrat_id INTEGER,
        type_incident TEXT NOT NULL,
        description TEXT NOT NULL,
        urgence TEXT NOT NULL DEFAULT 'normal',
        photo_url TEXT,
        statut TEXT NOT NULL DEFAULT 'signale',
        prise_en_charge_crous INTEGER DEFAULT 0,
        date_signalement DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_prise_en_charge DATETIME,
        date_cloture DATETIME,
        valide_par INTEGER,
        technicien_id INTEGER,
        commentaire_validation TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (locataire_id) REFERENCES utilisateurs(id),
        FOREIGN KEY (local_id) REFERENCES locaux(id),
        FOREIGN KEY (contrat_id) REFERENCES contrats(id),
        FOREIGN KEY (valide_par) REFERENCES utilisateurs(id),
        FOREIGN KEY (technicien_id) REFERENCES utilisateurs(id),
        CHECK(urgence IN ('faible', 'normal', 'urgent', 'critique')),
        CHECK(statut IN ('signale', 'en_attente', 'pris_en_charge', 'en_cours', 'resolu', 'cloture', 'rejete')),
        CHECK(type_incident IN ('plomberie', 'electricite', 'structure', 'securite', 'nettoyage', 'autre'))
    )";
    
    $db->exec($sql);
    
    $db->exec("CREATE INDEX IF NOT EXISTS idx_incidents_locataire ON incidents(locataire_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_incidents_statut ON incidents(statut)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_incidents_technicien ON incidents(technicien_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_incidents_urgence ON incidents(urgence)");
    
    echo "Migration incidents terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration incidents: " . $e->getMessage() . "\n";
    exit(1);
}
