<?php

namespace App\Models;

class Echeance extends Model
{
    protected string $table = 'echeances';

    public function findByContratId(int $contratId): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE contrat_id = :contrat_id ORDER BY annee DESC, mois DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['contrat_id' => $contratId]);
        return $stmt->fetchAll();
    }

    public function findUpcoming(int $contratId): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE contrat_id = :contrat_id AND statut = 'a_venir'
                ORDER BY date_echeance ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['contrat_id' => $contratId]);
        return $stmt->fetchAll();
    }

    public function findOverdue(): array
    {
        $sql = "SELECT e.*, c.reference as contrat_reference, c.locataire_id,
                u.prenom, u.nom
                FROM {$this->table} e
                JOIN contrats c ON e.contrat_id = c.id
                JOIN utilisateurs u ON c.locataire_id = u.id
                WHERE e.statut = 'en_retard'
                ORDER BY e.date_echeance ASC";
        return $this->db->query($sql)->fetchAll();
    }

    public function findByMonthYear(int $mois, int $annee): array
    {
        $sql = "SELECT e.*, c.reference as contrat_reference, u.prenom, u.nom
                FROM {$this->table} e
                JOIN contrats c ON e.contrat_id = c.id
                JOIN utilisateurs u ON c.locataire_id = u.id
                WHERE e.mois = :mois AND e.annee = :annee
                ORDER BY u.nom ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['mois' => $mois, 'annee' => $annee]);
        return $stmt->fetchAll();
    }

    public function markAsPaid(int $id, string $statut = 'paye'): bool
    {
        $validStatuts = ['paye', 'partiellement_paye'];
        if (!in_array($statut, $validStatuts)) {
            return false;
        }

        $sql = "UPDATE {$this->table} SET statut = :statut WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['statut' => $statut, 'id' => $id]);
    }

    public function markAsLate(int $id): bool
    {
        $sql = "UPDATE {$this->table} SET statut = 'en_retard' WHERE id = :id AND statut = 'a_venir'";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    public function detectOverdue(): int
    {
        $sql = "UPDATE {$this->table} SET statut = 'en_retard' 
                WHERE statut = 'a_venir' AND date_echeance < date('now')";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->rowCount();
    }

    public function generateForContrat(int $contratId, float $montant, int $mois, int $annee): ?int
    {
        $dateEcheance = sprintf('%04d-%02d-05', $annee, $mois);

        $sql = "INSERT OR IGNORE INTO {$this->table} (contrat_id, mois, annee, montant_prevu, date_echeance, statut)
                VALUES (:contrat_id, :mois, :annee, :montant, :date_echeance, 'a_venir')";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'contrat_id' => $contratId,
            'mois' => $mois,
            'annee' => $annee,
            'montant' => $montant,
            'date_echeance' => $dateEcheance
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function getStats(): array
    {
        $sql = "SELECT statut, COUNT(*) as count, SUM(montant_prevu) as total 
                FROM {$this->table} GROUP BY statut";
        return $this->db->query($sql)->fetchAll();
    }
}
