<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS contrats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT UNIQUE NOT NULL,
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (demande_id) REFERENCES demandes(id),
        FOREIGN KEY (local_id) REFERENCES locaux(id),
        FOREIGN KEY (locataire_id) REFERENCES utilisateurs(id),
        CHECK(statut IN ('brouillon', 'en_attente_signature', 'signe', 'actif', 'resilie', 'expire')),
        CHECK(periodicite IN ('mensuel', 'trimestriel', 'annuel'))
    )";
    
    $db->exec($sql);
    
    // Create indexes
    $db->exec("CREATE INDEX IF NOT EXISTS idx_contrats_reference ON contrats(reference)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_contrats_demande_id ON contrats(demande_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_contrats_locataire ON contrats(locataire_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_contrats_local ON contrats(local_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_contrats_statut ON contrats(statut)");
    
    echo "Migration contrats terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration contrats: " . $e->getMessage() . "\n";
    exit(1);
}
