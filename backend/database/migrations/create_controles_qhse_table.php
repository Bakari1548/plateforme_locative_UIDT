<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS controles_qhse (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT UNIQUE NOT NULL,
        local_id INTEGER NOT NULL,
        controleur_id INTEGER NOT NULL,
        date_controle DATETIME DEFAULT CURRENT_TIMESTAMP,
        type_controle TEXT NOT NULL,
        score_proprete INTEGER DEFAULT 0,
        score_securite INTEGER DEFAULT 0,
        score_entretien INTEGER DEFAULT 0,
        score_global INTEGER DEFAULT 0,
        observations TEXT,
        recommandations TEXT,
        statut TEXT NOT NULL DEFAULT 'planifie',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (local_id) REFERENCES locaux(id),
        FOREIGN KEY (controleur_id) REFERENCES utilisateurs(id),
        CHECK(type_controle IN ('periodique', 'signalement', 'fin_bail', 'pre_affectation')),
        CHECK(statut IN ('planifie', 'en_cours', 'termine', 'cloture')),
        CHECK(score_proprete >= 0 AND score_proprete <= 100),
        CHECK(score_securite >= 0 AND score_securite <= 100),
        CHECK(score_entretien >= 0 AND score_entretien <= 100)
    )";
    
    $db->exec($sql);
    
    $db->exec("CREATE INDEX IF NOT EXISTS idx_controles_local ON controles_qhse(local_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_controles_controleur ON controles_qhse(controleur_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_controles_statut ON controles_qhse(statut)");
    
    echo "Migration controles_qhse terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration controles_qhse: " . $e->getMessage() . "\n";
    exit(1);
}
