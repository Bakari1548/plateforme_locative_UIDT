<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS transferts_locaux (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        local_id INTEGER NOT NULL,
        ancien_locataire_id INTEGER,
        nouveau_locataire_id INTEGER NOT NULL,
        ancien_contrat_id INTEGER,
        nouveau_contrat_id INTEGER,
        date_transfert DATETIME DEFAULT CURRENT_TIMESTAMP,
        motif TEXT,
        valide_par INTEGER,
        statut TEXT NOT NULL DEFAULT 'en_attente',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (local_id) REFERENCES locaux(id),
        FOREIGN KEY (ancien_locataire_id) REFERENCES utilisateurs(id),
        FOREIGN KEY (nouveau_locataire_id) REFERENCES utilisateurs(id),
        FOREIGN KEY (ancien_contrat_id) REFERENCES contrats(id),
        FOREIGN KEY (nouveau_contrat_id) REFERENCES contrats(id),
        FOREIGN KEY (valide_par) REFERENCES utilisateurs(id),
        CHECK(statut IN ('en_attente', 'valide', 'refuse'))
    )";
    
    $db->exec($sql);
    
    $db->exec("CREATE INDEX IF NOT EXISTS idx_transferts_local_id ON transferts_locaux(local_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_transferts_nouveau_locataire ON transferts_locaux(nouveau_locataire_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_transferts_statut ON transferts_locaux(statut)");
    
    echo "Migration transferts_locaux terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration transferts_locaux: " . $e->getMessage() . "\n";
    exit(1);
}
