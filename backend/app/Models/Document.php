<?php

namespace App\Models;

class Document extends Model
{
    protected string $table = 'documents';

    public function findByDemandeId(int $demandeId): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE demande_id = :demande_id ORDER BY date_upload DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['demande_id' => $demandeId]);
        return $stmt->fetchAll();
    }

    public function findByType(string $type, int $demandeId): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE demande_id = :demande_id AND type_document = :type_document LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['demande_id' => $demandeId, 'type_document' => $type]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function updateStatut(int $id, string $statut, ?int $validePar = null, ?string $commentaire = null): bool
    {
        $validStatuts = ['en_attente', 'valide', 'refuse'];
        
        if (!in_array($statut, $validStatuts)) {
            return false;
        }

        $sql = "UPDATE {$this->table} SET statut = :statut";
        
        if ($statut === 'valide' || $statut === 'refuse') {
            $sql .= ", date_validation = CURRENT_TIMESTAMP";
        }

        if ($validePar !== null) {
            $sql .= ", valide_par = :valide_par";
        }

        if ($commentaire !== null) {
            $sql .= ", commentaire_validation = :commentaire";
        }

        $sql .= " WHERE id = :id";

        $stmt = $this->db->prepare($sql);
        $params = ['statut' => $statut, 'id' => $id];
        
        if ($validePar !== null) {
            $params['valide_par'] = $validePar;
        }
        
        if ($commentaire !== null) {
            $params['commentaire'] = $commentaire;
        }

        return $stmt->execute($params);
    }

    public function updateCloudinaryUrl(int $id, string $url, int $taille, string $mimeType): bool
    {
        $sql = "UPDATE {$this->table} SET url_cloudinary = :url, taille = :taille, mime_type = :mime_type WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['url' => $url, 'taille' => $taille, 'mime_type' => $mimeType, 'id' => $id]);
    }

    public function getPendingValidation(): array
    {
        $sql = "SELECT d.*, dem.numero_suivi, u.prenom, u.nom 
                FROM {$this->table} d
                JOIN demandes dem ON d.demande_id = dem.id
                JOIN utilisateurs u ON dem.user_id = u.id
                WHERE d.statut = 'en_attente'
                ORDER BY d.date_upload ASC";
        return $this->db->query($sql)->fetchAll();
    }

    public function checkDemandeCompleteness(int $demandeId): array
    {
        $requiredTypes = ['cni', 'casier_judiciaire', 'attestation_residence'];
        $sql = "SELECT type_document, statut FROM {$this->table} WHERE demande_id = :demande_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['demande_id' => $demandeId]);
        $documents = $stmt->fetchAll();

        $result = [
            'complete' => true,
            'missing' => [],
            'pending' => [],
            'rejected' => []
        ];

        $uploadedTypes = array_column($documents, 'type_document');

        foreach ($requiredTypes as $type) {
            if (!in_array($type, $uploadedTypes)) {
                $result['missing'][] = $type;
                $result['complete'] = false;
            }
        }

        foreach ($documents as $doc) {
            if ($doc['statut'] === 'en_attente') {
                $result['pending'][] = $doc['type_document'];
                $result['complete'] = false;
            } elseif ($doc['statut'] === 'refuse') {
                $result['rejected'][] = $doc['type_document'];
                $result['complete'] = false;
            }
        }

        return $result;
    }

    public function deleteByDemandeId(int $demandeId): bool
    {
        $sql = "DELETE FROM {$this->table} WHERE demande_id = :demande_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['demande_id' => $demandeId]);
    }
}
