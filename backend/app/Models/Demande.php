<?php

namespace App\Models;

class Demande extends Model
{
    protected string $table = 'demandes';

    public function generateNumeroSuivi(): string
    {
        $year = date('Y');
        $count = $this->count() + 1;
        return sprintf('DEM-%s-%04d', $year, $count);
    }

    public function findByNumeroSuivi(string $numeroSuivi): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE numero_suivi = :numero_suivi LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['numero_suivi' => $numeroSuivi]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findByUserId(int $userId): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE user_id = :user_id ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function findByStatut(string $statut): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE statut = :statut ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['statut' => $statut]);
        return $stmt->fetchAll();
    }

    public function updateStatut(int $id, string $statut, ?int $instructeurId = null, ?string $commentaire = null): bool
    {
        $validStatuts = ['brouillon', 'soumis', 'en_instruction', 'recevable', 'incomplet', 'rejete', 'en_commission', 'attribue', 'non_attribue'];
        
        if (!in_array($statut, $validStatuts)) {
            return false;
        }

        $sql = "UPDATE {$this->table} SET statut = :statut, updated_at = CURRENT_TIMESTAMP";
        
        if ($statut === 'en_instruction') {
            $sql .= ", date_instruction = CURRENT_TIMESTAMP";
        }
        
        if ($statut === 'attribue' || $statut === 'non_attribue') {
            $sql .= ", date_decision = CURRENT_TIMESTAMP";
        }

        if ($instructeurId !== null) {
            $sql .= ", instructeur_id = :instructeur_id";
        }

        if ($commentaire !== null) {
            $sql .= ", commentaire_instruction = :commentaire";
        }

        $sql .= " WHERE id = :id";

        $stmt = $this->db->prepare($sql);
        $params = ['statut' => $statut, 'id' => $id];
        
        if ($instructeurId !== null) {
            $params['instructeur_id'] = $instructeurId;
        }
        
        if ($commentaire !== null) {
            $params['commentaire'] = $commentaire;
        }

        return $stmt->execute($params);
    }

    public function getWithDocuments(int $id): ?array
    {
        $sql = "SELECT d.*, 
                GROUP_CONCAT(
                    json_object(
                        'id', doc.id,
                        'type_document', doc.type_document,
                        'nom_fichier', doc.nom_fichier,
                        'statut', doc.statut
                    )
                ) as documents
                FROM {$this->table} d
                LEFT JOIN documents doc ON d.id = doc.demande_id
                WHERE d.id = :id
                GROUP BY d.id";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        
        if ($result && $result['documents']) {
            $result['documents'] = json_decode('[' . $result['documents'] . ']', true);
        } else {
            $result['documents'] = [];
        }
        
        return $result ?: null;
    }

    public function getPendingInstruction(): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE statut = 'soumis' ORDER BY date_soumission ASC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getRecevables(): array
    {
        $sql = "SELECT d.*, u.prenom, u.nom, u.email
                FROM {$this->table} d
                LEFT JOIN utilisateurs u ON d.user_id = u.id
                WHERE d.statut = 'recevable' 
                ORDER BY d.updated_at ASC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getDecided(): array
    {
        $sql = "SELECT d.*, u.prenom, u.nom, u.email
                FROM {$this->table} d
                LEFT JOIN utilisateurs u ON d.user_id = u.id
                WHERE d.statut IN ('attribue', 'non_attribue', 'rejete')
                ORDER BY d.date_decision DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getInCommission(): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE statut = 'en_commission' ORDER BY date_instruction ASC";
        return $this->db->query($sql)->fetchAll();
    }

    public function assignLocal(int $id, int $localId): bool
    {
        $sql = "UPDATE {$this->table} SET local_id = :local_id, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['local_id' => $localId, 'id' => $id]);
    }

    public function getStats(): array
    {
        $sql = "SELECT statut, COUNT(*) as count FROM {$this->table} GROUP BY statut";
        return $this->db->query($sql)->fetchAll();
    }
}
