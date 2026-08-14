<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();

    $db->exec("BEGIN TRANSACTION");

    $db->exec("CREATE TABLE contrats_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT NOT NULL UNIQUE,
        demande_id INTEGER NOT NULL,
        local_id INTEGER,
        locataire_id INTEGER NOT NULL,
        date_debut DATE NOT NULL,
        date_fin DATE,
        montant_loyer REAL,
        periodicite TEXT DEFAULT 'mensuel',
        caution REAL DEFAULT 0,
        conditions_particulieres TEXT,
        statut TEXT NOT NULL DEFAULT 'brouillon',
        date_signature_locataire DATETIME,
        date_signature_dcuv DATETIME,
        signe_par_locataire INTEGER DEFAULT 0,
        signe_par_dcuv INTEGER DEFAULT 0,
        fichier_pdf TEXT,
        fichier_contrat TEXT,
        commentaire_directeur TEXT,
        valide_par_directeur_id INTEGER,
        date_validation_directeur DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (demande_id) REFERENCES demandes(id),
        FOREIGN KEY (local_id) REFERENCES locaux(id),
        FOREIGN KEY (locataire_id) REFERENCES utilisateurs(id),
        CHECK(statut IN ('brouillon', 'en_validation_directeur', 'en_attente_signature', 'signe', 'actif', 'resilie', 'expire')),
        CHECK(periodicite IN ('mensuel', 'trimestriel', 'annuel'))
    )");

    $db->exec("INSERT INTO contrats_new SELECT * FROM contrats");
    $db->exec("DROP TABLE contrats");
    $db->exec("ALTER TABLE contrats_new RENAME TO contrats");

    $db->exec("COMMIT");

    echo "Migration fix_contrats_check_constraint terminée avec succès\n";
} catch (PDOException $e) {
    $db->exec("ROLLBACK");
    echo "Erreur migration: " . $e->getMessage() . "\n";
    exit(1);
}
