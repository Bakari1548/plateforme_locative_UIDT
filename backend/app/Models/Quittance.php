<?php

namespace App\Models;

class Quittance extends Model
{
    protected string $table = 'quittances';

    public function generateReference(): string
    {
        $year = date('Y');
        $count = $this->count() + 1;
        return sprintf('QUI-%s-%05d', $year, $count);
    }

    public function findByPaiementId(int $paiementId): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE paiement_id = :paiement_id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['paiement_id' => $paiementId]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function getWithDetails(int $id): ?array
    {
        $sql = "SELECT q.*, p.montant as paiement_montant, p.date_paiement, p.mode_paiement,
                c.reference as contrat_reference, c.montant_loyer,
                u.prenom, u.nom, u.email, u.telephone, u.profession
                FROM {$this->table} q
                JOIN paiements p ON q.paiement_id = p.id
                JOIN contrats c ON p.contrat_id = c.id
                JOIN utilisateurs u ON p.locataire_id = u.id
                WHERE q.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findByLocataireId(int $locataireId): array
    {
        $sql = "SELECT q.*, p.montant as paiement_montant, p.date_paiement,
                c.reference as contrat_reference
                FROM {$this->table} q
                JOIN paiements p ON q.paiement_id = p.id
                JOIN contrats c ON p.contrat_id = c.id
                WHERE p.locataire_id = :locataire_id
                ORDER BY q.date_emission DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['locataire_id' => $locataireId]);
        return $stmt->fetchAll();
    }

    public function createForPaiement(int $paiementId, float $montant, string $periode): ?array
    {
        $reference = $this->generateReference();

        $sql = "INSERT INTO {$this->table} (paiement_id, reference, montant, periode)
                VALUES (:paiement_id, :reference, :montant, :periode)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'paiement_id' => $paiementId,
            'reference' => $reference,
            'montant' => (string)$montant,
            'periode' => $periode
        ]);

        $id = (int) $this->db->lastInsertId();
        return $this->find($id);
    }

    public function updatePdfPath(int $id, string $path): bool
    {
        $sql = "UPDATE {$this->table} SET fichier_pdf = :path WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['path' => $path, 'id' => $id]);
    }
}
