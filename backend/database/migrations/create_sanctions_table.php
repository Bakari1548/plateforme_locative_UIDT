<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS sanctions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT UNIQUE NOT NULL,
        locataire_id INTEGER NOT NULL,
        local_id INTEGER,
        controle_id INTEGER,
        type_sanction TEXT NOT NULL,
        motif TEXT NOT NULL,
        description TEXT,
        date_sanction DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_debut DATE,
        date_fin DATE,
        statut TEXT NOT NULL DEFAULT 'active',
        cree_par INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (locataire_id) REFERENCES utilisateurs(id),
        FOREIGN KEY (local_id) REFERENCES locaux(id),
        FOREIGN KEY (controle_id) REFERENCES controles_qhse(id),
        FOREIGN KEY (cree_par) REFERENCES utilisateurs(id),
        CHECK(type_sanction IN ('avertissement', 'mise_en_demeure', 'penalite_financiere', 'resiliation_bail', 'suspension')),
        CHECK(statut IN ('active', 'levee', 'expiree'))
    )";
    
    $db->exec($sql);
    
    $db->exec("CREATE INDEX IF NOT EXISTS idx_sanctions_locataire ON sanctions(locataire_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_sanctions_statut ON sanctions(statut)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_sanctions_controle ON sanctions(controle_id)");
    
    echo "Migration sanctions terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration sanctions: " . $e->getMessage() . "\n";
    exit(1);
}
