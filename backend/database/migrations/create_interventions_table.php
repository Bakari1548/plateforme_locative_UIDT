<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS interventions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id INTEGER NOT NULL,
        technicien_id INTEGER NOT NULL,
        date_intervention DATETIME DEFAULT CURRENT_TIMESTAMP,
        diagnostic TEXT,
        action_realisee TEXT,
        pieces_utilisees TEXT,
        duree_minutes INTEGER,
        resultat TEXT,
        statut TEXT NOT NULL DEFAULT 'planifiee',
        photo_avant_url TEXT,
        photo_apres_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
        FOREIGN KEY (technicien_id) REFERENCES utilisateurs(id),
        CHECK(statut IN ('planifiee', 'en_cours', 'terminee', 'annulee'))
    )";
    
    $db->exec($sql);
    
    $db->exec("CREATE INDEX IF NOT EXISTS idx_interventions_incident ON interventions(incident_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_interventions_technicien ON interventions(technicien_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_interventions_statut ON interventions(statut)");
    
    echo "Migration interventions terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration interventions: " . $e->getMessage() . "\n";
    exit(1);
}
