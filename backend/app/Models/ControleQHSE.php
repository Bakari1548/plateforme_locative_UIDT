<?php

namespace App\Models;

class ControleQHSE extends Model
{
    protected string $table = 'controles_qhse';

    public function generateReference(): string
    {
        $year = date('Y');
        $count = $this->count() + 1;
        return sprintf('QHSE-%s-%04d', $year, $count);
    }

    public function findByLocalId(int $localId): array
    {
        $sql = "SELECT c.*, l.reference as local_reference
                FROM {$this->table} c
                JOIN locaux l ON c.local_id = l.id
                WHERE c.local_id = :local_id
                ORDER BY c.date_controle DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['local_id' => $localId]);
        return $stmt->fetchAll();
    }

    public function findByControleurId(int $controleurId): array
    {
        $sql = "SELECT c.*, l.reference as local_reference
                FROM {$this->table} c
                JOIN locaux l ON c.local_id = l.id
                WHERE c.controleur_id = :controleur_id
                ORDER BY c.date_controle DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['controleur_id' => $controleurId]);
        return $stmt->fetchAll();
    }

    public function getWithDetails(int $id): ?array
    {
        $sql = "SELECT c.*, l.reference as local_reference, l.type as local_type, l.zone,
                u.prenom as controleur_prenom, u.nom as controleur_nom
                FROM {$this->table} c
                JOIN locaux l ON c.local_id = l.id
                JOIN utilisateurs u ON c.controleur_id = u.id
                WHERE c.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function getPending(): array
    {
        $sql = "SELECT c.*, l.reference as local_reference
                FROM {$this->table} c
                JOIN locaux l ON c.local_id = l.id
                WHERE c.statut IN ('planifie', 'en_cours')
                ORDER BY c.date_controle ASC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getCompleted(): array
    {
        $sql = "SELECT c.*, l.reference as local_reference
                FROM {$this->table} c
                JOIN locaux l ON c.local_id = l.id
                WHERE c.statut IN ('termine', 'cloture')
                ORDER BY c.date_controle DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function updateScores(int $id, array $scores, ?string $observations, ?string $recommandations): bool
    {
        $scoreGlobal = round(($scores['score_proprete'] + $scores['score_securite'] + $scores['score_entretien']) / 3);

        $sql = "UPDATE {$this->table} 
                SET score_proprete = :proprete, score_securite = :securite, 
                    score_entretien = :entretien, score_global = :global,
                    observations = :observations, recommandations = :recommandations,
                    statut = 'termine'
                WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'proprete' => $scores['score_proprete'],
            'securite' => $scores['score_securite'],
            'entretien' => $scores['score_entretien'],
            'global' => $scoreGlobal,
            'observations' => $observations,
            'recommandations' => $recommandations,
            'id' => $id
        ]);
    }

    public function getStats(): array
    {
        $sql = "SELECT 
                    COUNT(*) as total,
                    AVG(score_global) as avg_score,
                    COUNT(CASE WHEN score_global >= 80 THEN 1 END) as excellent,
                    COUNT(CASE WHEN score_global >= 60 AND score_global < 80 THEN 1 END) as acceptable,
                    COUNT(CASE WHEN score_global < 60 THEN 1 END) as insuffisant
                FROM {$this->table} WHERE statut IN ('termine', 'cloture')";
        return $this->db->query($sql)->fetch();
    }
}
