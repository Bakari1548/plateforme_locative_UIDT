<?php

require_once __DIR__ . '/../config/database.php';

try {
    $db = App\Config\Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        demande_id INTEGER NOT NULL,
        type_document TEXT NOT NULL,
        nom_fichier TEXT NOT NULL,
        url_cloudinary TEXT,
        taille INTEGER,
        mime_type TEXT,
        statut TEXT NOT NULL DEFAULT 'en_attente',
        date_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
        valide_par INTEGER,
        date_validation DATETIME,
        commentaire_validation TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE,
        FOREIGN KEY (valide_par) REFERENCES utilisateurs(id),
        CHECK(type_document IN ('cni', 'casier_judiciaire', 'attestation_residence', 'plan_affaires', 'autre')),
        CHECK(statut IN ('en_attente', 'valide', 'refuse'))
    )";
    
    $db->exec($sql);
    
    // Create indexes
    $db->exec("CREATE INDEX IF NOT EXISTS idx_documents_demande_id ON documents(demande_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type_document)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_documents_statut ON documents(statut)");
    
    echo "Migration documents terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration documents: " . $e->getMessage() . "\n";
    exit(1);
}
