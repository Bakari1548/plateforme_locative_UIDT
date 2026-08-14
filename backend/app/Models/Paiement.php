<?php

namespace App\Models;

class Paiement extends Model
{
    protected string $table = 'paiements';

    public function generateReferenceRecu(): string
    {
        $year = date('Y');
        $count = $this->count() + 1;
        return sprintf('REC-%s-%05d', $year, $count);
    }

    public function findByContratId(int $contratId): array
    {
        $sql = "SELECT p.*, u.prenom as enregistre_prenom, u.nom as enregistre_nom
                FROM {$this->table} p
                LEFT JOIN utilisateurs u ON p.enregistre_par = u.id
                WHERE p.contrat_id = :contrat_id
                ORDER BY p.date_paiement DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['contrat_id' => $contratId]);
        return $stmt->fetchAll();
    }

    public function findByLocataireId(int $locataireId): array
    {
        $sql = "SELECT p.*, c.reference as contrat_reference
                FROM {$this->table} p
                JOIN contrats c ON p.contrat_id = c.id
                WHERE p.locataire_id = :locataire_id
                ORDER BY p.date_paiement DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['locataire_id' => $locataireId]);
        return $stmt->fetchAll();
    }

    public function getWithDetails(int $id): ?array
    {
        $sql = "SELECT p.*, 
                c.reference as contrat_reference, c.montant_loyer,
                u.prenom as locataire_prenom, u.nom as locataire_nom, u.email, u.telephone,
                e.mois, e.annee, e.date_echeance,
                en.prenom as enregistre_prenom, en.nom as enregistre_nom
                FROM {$this->table} p
                JOIN contrats c ON p.contrat_id = c.id
                JOIN utilisateurs u ON p.locataire_id = u.id
                LEFT JOIN echeances e ON p.echeance_id = e.id
                JOIN utilisateurs en ON p.enregistre_par = en.id
                WHERE p.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function getRecent(int $limit = 20): array
    {
        $sql = "SELECT p.*, c.reference as contrat_reference,
                u.prenom, u.nom
                FROM {$this->table} p
                JOIN contrats c ON p.contrat_id = c.id
                JOIN utilisateurs u ON p.locataire_id = u.id
                ORDER BY p.date_paiement DESC
                LIMIT :limit";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getByMonth(int $mois, int $annee): array
    {
        $sql = "SELECT p.*, c.reference as contrat_reference,
                u.prenom, u.nom
                FROM {$this->table} p
                JOIN contrats c ON p.contrat_id = c.id
                JOIN utilisateurs u ON p.locataire_id = u.id
                WHERE strftime('%m', p.date_paiement) = :mois 
                AND strftime('%Y', p.date_paiement) = :annee
                ORDER BY p.date_paiement DESC";
        $stmt = $this->db->prepare($sql);
        $moisStr = sprintf('%02d', $mois);
        $stmt->execute(['mois' => $moisStr, 'annee' => (string)$annee]);
        return $stmt->fetchAll();
    }

    public function getTotalByMonth(int $mois, int $annee): float
    {
        $sql = "SELECT SUM(montant) as total FROM {$this->table}
                WHERE strftime('%m', date_paiement) = :mois 
                AND strftime('%Y', date_paiement) = :annee";
        $stmt = $this->db->prepare($sql);
        $moisStr = sprintf('%02d', $mois);
        $stmt->execute(['mois' => $moisStr, 'annee' => (string)$annee]);
        $result = $stmt->fetch();
        return (float)($result['total'] ?? 0);
    }

    public function getStats(): array
    {
        $sql = "SELECT 
                    COUNT(*) as total_paiements,
                    SUM(montant) as total_montant,
                    COUNT(DISTINCT locataire_id) as total_locataires
                FROM {$this->table}";
        return $this->db->query($sql)->fetch();
    }

    public function getOverdueLocataires(): array
    {
        $sql = "SELECT DISTINCT u.id, u.prenom, u.nom, u.email, u.telephone,
                c.reference as contrat_reference,
                COUNT(e.id) as nb_echeances_retard,
                SUM(e.montant_prevu) as montant_retard
                FROM echeances e
                JOIN contrats c ON e.contrat_id = c.id
                JOIN utilisateurs u ON c.locataire_id = u.id
                WHERE e.statut = 'en_retard' AND c.statut = 'actif'
                GROUP BY u.id
                ORDER BY montant_retard DESC";
        return $this->db->query($sql)->fetchAll();
    }
}
