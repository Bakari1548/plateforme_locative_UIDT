<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();

    $db->exec("BEGIN TRANSACTION");

    $db->exec("CREATE TABLE incidents_new (
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
        CHECK(statut IN ('signale', 'en_attente', 'planifie', 'en_cours', 'termine', 'cloture', 'rejete')),
        CHECK(type_incident IN ('plomberie', 'electricite', 'structure', 'securite', 'nettoyage', 'autre'))
    )");

    $db->exec("INSERT INTO incidents_new
        SELECT id, reference, locataire_id, local_id, contrat_id, type_incident, description, urgence, photo_url,
               CASE statut
                   WHEN 'pris_en_charge' THEN 'planifie'
                   WHEN 'resolu' THEN 'termine'
                   ELSE statut
               END,
               prise_en_charge_crous, date_signalement, date_prise_en_charge, date_cloture, valide_par, technicien_id, commentaire_validation, created_at
        FROM incidents");
    $db->exec("DROP TABLE incidents");
    $db->exec("ALTER TABLE incidents_new RENAME TO incidents");

    $db->exec("CREATE INDEX IF NOT EXISTS idx_incidents_locataire ON incidents(locataire_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_incidents_statut ON incidents(statut)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_incidents_technicien ON incidents(technicien_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_incidents_urgence ON incidents(urgence)");

    $db->exec("COMMIT");

    echo "Migration fix_incidents_check_constraint terminée avec succès\n";
} catch (PDOException $e) {
    $db->exec("ROLLBACK");
    echo "Erreur migration: " . $e->getMessage() . "\n";
    exit(1);
}
