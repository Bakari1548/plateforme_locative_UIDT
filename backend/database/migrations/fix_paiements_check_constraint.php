<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();

    $db->exec("BEGIN TRANSACTION");

    $db->exec("CREATE TABLE paiements_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contrat_id INTEGER NOT NULL,
        locataire_id INTEGER NOT NULL,
        echeance_id INTEGER,
        montant REAL NOT NULL,
        mode_paiement TEXT NOT NULL DEFAULT 'especes',
        date_paiement DATETIME DEFAULT CURRENT_TIMESTAMP,
        enregistre_par INTEGER NOT NULL,
        reference_recu TEXT,
        commentaire TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contrat_id) REFERENCES contrats(id),
        FOREIGN KEY (locataire_id) REFERENCES utilisateurs(id),
        FOREIGN KEY (echeance_id) REFERENCES echeances(id),
        FOREIGN KEY (enregistre_par) REFERENCES utilisateurs(id),
        CHECK(mode_paiement IN ('especes', 'cheque', 'virement', 'mobile_money'))
    )");

    $db->exec("INSERT INTO paiements_new SELECT * FROM paiements");
    $db->exec("DROP TABLE paiements");
    $db->exec("ALTER TABLE paiements_new RENAME TO paiements");

    $db->exec("COMMIT");

    echo "Migration fix_paiements_check_constraint terminée avec succès\n";
} catch (PDOException $e) {
    $db->exec("ROLLBACK");
    echo "Erreur migration: " . $e->getMessage() . "\n";
    exit(1);
}
