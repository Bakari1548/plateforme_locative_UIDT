<?php

require_once __DIR__ . '/../../config/database.php';

try {
    $db = App\Config\Database::getInstance();

    $columns = $db->query("PRAGMA table_info(contrats)")->fetchAll();
    $columnNames = array_column($columns, 'name');

    $newColumns = [
        'fichier_contrat' => 'TEXT',
        'commentaire_directeur' => 'TEXT',
        'valide_par_directeur_id' => 'INTEGER',
        'date_validation_directeur' => 'DATETIME',
    ];

    foreach ($newColumns as $col => $type) {
        if (!in_array($col, $columnNames)) {
            $db->exec("ALTER TABLE contrats ADD COLUMN {$col} {$type}");
        }
    }

    echo "Migration alter_contrats_add_validation terminée avec succès\n";
} catch (PDOException $e) {
    echo "Erreur migration alter_contrats: " . $e->getMessage() . "\n";
    exit(1);
}
