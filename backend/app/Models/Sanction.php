<?php

namespace App\Models;

class Sanction extends Model
{
    protected string $table = 'sanctions';

    public function generateReference(): string
    {
        $year = date('Y');
        $count = $this->count() + 1;
        return sprintf('SAN-%s-%04d', $year, $count);
    }

    public function findByLocataireId(int $locataireId): array
    {
        $sql = "SELECT s.*, l.reference as local_reference,
                c.reference as controle_reference
                FROM {$this->table} s
                LEFT JOIN locaux l ON s.local_id = l.id
                LEFT JOIN controles_qhse c ON s.controle_id = c.id
                WHERE s.locataire_id = :locataire_id
                ORDER BY s.date_sanction DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['locataire_id' => $locataireId]);
        return $stmt->fetchAll();
    }

    public function getWithDetails(int $id): ?array
    {
        $sql = "SELECT s.*, 
                u.prenom as locataire_prenom, u.nom as locataire_nom, u.email, u.telephone,
                l.reference as local_reference,
                c.reference as controle_reference, c.score_global,
                cr.prenom as cree_par_prenom, cr.nom as cree_par_nom
                FROM {$this->table} s
                JOIN utilisateurs u ON s.locataire_id = u.id
                LEFT JOIN locaux l ON s.local_id = l.id
                LEFT JOIN controles_qhse c ON s.controle_id = c.id
                JOIN utilisateurs cr ON s.cree_par = cr.id
                WHERE s.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function getActive(): array
    {
        $sql = "SELECT s.*, u.prenom, u.nom, l.reference as local_reference
                FROM {$this->table} s
                JOIN utilisateurs u ON s.locataire_id = u.id
                LEFT JOIN locaux l ON s.local_id = l.id
                WHERE s.statut = 'active'
                ORDER BY s.date_sanction DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getByControleId(int $controleId): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE controle_id = :controle_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['controle_id' => $controleId]);
        return $stmt->fetchAll();
    }

    public function lever(int $id): bool
    {
        $sql = "UPDATE {$this->table} SET statut = 'levee' WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    public function getStats(): array
    {
        $sql = "SELECT type_sanction, COUNT(*) as count FROM {$this->table} WHERE statut = 'active' GROUP BY type_sanction";
        return $this->db->query($sql)->fetchAll();
    }
}
