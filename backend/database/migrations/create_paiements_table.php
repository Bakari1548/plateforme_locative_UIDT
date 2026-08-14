<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS paiements (
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
        CHECK(mode_paiement IN ('especes', 'cheque', 'virement'))
    )";
    
    $db->exec($sql);
    
    $db->exec("CREATE INDEX IF NOT EXISTS idx_paiements_contrat ON paiements(contrat_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_paiements_locataire ON paiements(locataire_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_paiements_date ON paiements(date_paiement)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_paiements_echeance ON paiements(echeance_id)");
    
    echo "Migration paiements terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration paiements: " . $e->getMessage() . "\n";
    exit(1);
}
