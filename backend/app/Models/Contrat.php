<?php

namespace App\Models;

class Contrat extends Model
{
    protected string $table = 'contrats';

    public function generateReference(): string
    {
        $year = date('Y');
        $count = $this->count() + 1;
        return sprintf('CTR-%s-%04d', $year, $count);
    }

    public function findByDemandeId(int $demandeId): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE demande_id = :demande_id ORDER BY created_at DESC LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['demande_id' => $demandeId]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findByLocataireId(int $locataireId): array
    {
        $sql = "SELECT ctr.*, d.numero_suivi, d.type_local,
                u.prenom, u.nom, u.email, u.telephone, u.profession, u.numero_cni,
                l.reference as local_reference, l.type as local_type, l.zone, l.surface, l.usage as local_usage
                FROM {$this->table} ctr
                JOIN demandes d ON ctr.demande_id = d.id
                JOIN utilisateurs u ON ctr.locataire_id = u.id
                LEFT JOIN locaux l ON ctr.local_id = l.id
                WHERE ctr.locataire_id = :locataire_id ORDER BY ctr.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['locataire_id' => $locataireId]);
        return $stmt->fetchAll();
    }

    public function findByReference(string $reference): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE reference = :reference LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['reference' => $reference]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function getWithDetails(int $id): ?array
    {
        $sql = "SELECT ctr.*, d.numero_suivi, d.type_local,
                u.prenom, u.nom, u.email, u.telephone, u.profession, u.numero_cni,
                l.reference as local_reference, l.type as local_type, l.zone, l.surface, l.usage as local_usage, l.loyer_mensuel
                FROM {$this->table} ctr
                JOIN demandes d ON ctr.demande_id = d.id
                JOIN utilisateurs u ON ctr.locataire_id = u.id
                LEFT JOIN locaux l ON ctr.local_id = l.id
                WHERE ctr.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function updateStatut(int $id, string $statut): bool
    {
        $validStatuts = ['brouillon', 'en_validation_directeur', 'en_attente_signature', 'signe', 'actif', 'resilie', 'expire'];
        if (!in_array($statut, $validStatuts)) {
            return false;
        }

        $sql = "UPDATE {$this->table} SET statut = :statut, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['statut' => $statut, 'id' => $id]);
    }

    public function signByLocataire(int $id): bool
    {
        $sql = "UPDATE {$this->table} 
                SET signe_par_locataire = 1, date_signature_locataire = CURRENT_TIMESTAMP,
                    statut = 'actif',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    public function signByDcuv(int $id): bool
    {
        $sql = "UPDATE {$this->table} 
                SET signe_par_dcuv = 1, date_signature_dcuv = CURRENT_TIMESTAMP,
                    statut = CASE WHEN signe_par_locataire = 1 THEN 'signe' ELSE 'en_attente_signature' END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    public function activate(int $id): bool
    {
        return $this->updateStatut($id, 'actif');
    }

    public function resiliate(int $id, ?string $motif = null): bool
    {
        $sql = "UPDATE {$this->table} SET statut = 'resilie', updated_at = CURRENT_TIMESTAMP";
        if ($motif) {
            $sql .= ", conditions_particulieres = :motif";
        }
        $sql .= " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $params = ['id' => $id];
        if ($motif) {
            $params['motif'] = $motif;
        }
        return $stmt->execute($params);
    }

    public function getActiveContrats(): array
    {
        $sql = "SELECT ctr.*, d.numero_suivi, u.prenom, u.nom, l.reference as local_reference
                FROM {$this->table} ctr
                JOIN demandes d ON ctr.demande_id = d.id
                JOIN utilisateurs u ON ctr.locataire_id = u.id
                LEFT JOIN locaux l ON ctr.local_id = l.id
                WHERE ctr.statut = 'actif'
                ORDER BY ctr.created_at DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getPendingSignature(): array
    {
        $sql = "SELECT ctr.*, d.numero_suivi, u.prenom, u.nom
                FROM {$this->table} ctr
                JOIN demandes d ON ctr.demande_id = d.id
                JOIN utilisateurs u ON ctr.locataire_id = u.id
                WHERE ctr.statut IN ('brouillon', 'en_attente_signature')
                ORDER BY ctr.created_at DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getStats(): array
    {
        $sql = "SELECT statut, COUNT(*) as count FROM {$this->table} GROUP BY statut";
        return $this->db->query($sql)->fetchAll();
    }

    public function updatePdfPath(int $id, string $path): bool
    {
        $sql = "UPDATE {$this->table} SET fichier_pdf = :path, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['path' => $path, 'id' => $id]);
    }

    public function submitToDirecteur(int $id, string $fichierPath): bool
    {
        $sql = "UPDATE {$this->table} SET fichier_contrat = :path, statut = 'en_validation_directeur', updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['path' => $fichierPath, 'id' => $id]);
    }

    public function validateByDirecteur(int $id, int $directeurId, string $decision, ?string $commentaire = null): bool
    {
        if ($decision === 'approuve') {
            $sql = "UPDATE {$this->table} SET statut = 'en_attente_signature', valide_par_directeur_id = :directeur_id, date_validation_directeur = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute(['directeur_id' => $directeurId, 'id' => $id]);
        } else {
            $sql = "UPDATE {$this->table} SET statut = 'brouillon', commentaire_directeur = :commentaire, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute(['commentaire' => $commentaire, 'id' => $id]);
        }
    }

    public function getPendingDirecteurValidation(): array
    {
        $sql = "SELECT ctr.*, d.numero_suivi, d.type_local, d.motif,
                u.prenom, u.nom, u.email, u.telephone,
                l.reference as local_reference, l.type as local_type, l.zone, l.surface
                FROM {$this->table} ctr
                JOIN demandes d ON ctr.demande_id = d.id
                JOIN utilisateurs u ON ctr.locataire_id = u.id
                LEFT JOIN locaux l ON ctr.local_id = l.id
                WHERE ctr.statut = 'en_validation_directeur'
                ORDER BY ctr.created_at DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getBrouillons(): array
    {
        $sql = "SELECT ctr.*, d.numero_suivi, d.type_local, d.motif,
                u.prenom, u.nom, u.email, u.telephone, u.profession, u.numero_cni,
                l.reference as local_reference, l.type as local_type, l.zone, l.surface, l.usage as local_usage
                FROM {$this->table} ctr
                JOIN demandes d ON ctr.demande_id = d.id
                JOIN utilisateurs u ON ctr.locataire_id = u.id
                LEFT JOIN locaux l ON ctr.local_id = l.id
                WHERE ctr.statut = 'brouillon'
                ORDER BY ctr.created_at DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function sendToDirecteur(int $id): bool
    {
        $sql = "UPDATE {$this->table} SET statut = 'en_validation_directeur', updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }
}
