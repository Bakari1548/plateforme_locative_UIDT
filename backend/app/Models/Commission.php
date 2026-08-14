<?php

namespace App\Models;

class Commission extends Model
{
    protected string $table = 'commissions';

    public function findByDemandeId(int $demandeId): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE demande_id = :demande_id ORDER BY created_at DESC LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['demande_id' => $demandeId]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function getWithMembres(int $id): ?array
    {
        $commission = $this->find($id);
        if (!$commission) {
            return null;
        }

        $sql = "SELECT cm.*, u.prenom, u.nom, u.role 
                FROM commission_membres cm
                JOIN utilisateurs u ON cm.user_id = u.id
                WHERE cm.commission_id = :commission_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['commission_id' => $id]);
        $commission['membres'] = $stmt->fetchAll();

        return $commission;
    }

    public function addMembre(int $commissionId, int $userId, ?string $roleCommission = null): bool
    {
        $sql = "INSERT INTO commission_membres (commission_id, user_id, role_commission) 
                VALUES (:commission_id, :user_id, :role_commission)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'commission_id' => $commissionId,
            'user_id' => $userId,
            'role_commission' => $roleCommission
        ]);
    }

    public function removeMembre(int $commissionId, int $userId): bool
    {
        $sql = "DELETE FROM commission_membres WHERE commission_id = :commission_id AND user_id = :user_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['commission_id' => $commissionId, 'user_id' => $userId]);
    }

    public function markPresence(int $commissionId, int $userId, bool $present): bool
    {
        $sql = "UPDATE commission_membres SET present = :present WHERE commission_id = :commission_id AND user_id = :user_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'present' => $present ? 1 : 0,
            'commission_id' => $commissionId,
            'user_id' => $userId
        ]);
    }

    public function updateAvis(int $id, string $avis, string $avisMotive, ?string $recommandation = null): bool
    {
        $sql = "UPDATE {$this->table} 
                SET avis = :avis, avis_motive = :avis_motive, recommandation = :recommandation,
                    statut = 'avis_emis', date_avis = CURRENT_TIMESTAMP
                WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'avis' => $avis,
            'avis_motive' => $avisMotive,
            'recommandation' => $recommandation,
            'id' => $id
        ]);
    }

    public function updateStatut(int $id, string $statut): bool
    {
        $validStatuts = ['planifiee', 'en_cours', 'avis_emis', 'cloturee'];
        if (!in_array($statut, $validStatuts)) {
            return false;
        }

        $sql = "UPDATE {$this->table} SET statut = :statut WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['statut' => $statut, 'id' => $id]);
    }

    public function getPending(): array
    {
        $sql = "SELECT c.*, d.numero_suivi, d.type_local, d.motif, u.prenom, u.nom
                FROM {$this->table} c
                JOIN demandes d ON c.demande_id = d.id
                JOIN utilisateurs u ON d.user_id = u.id
                WHERE c.statut IN ('planifiee', 'en_cours')
                ORDER BY c.date_commission ASC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getWithAvis(): array
    {
        $sql = "SELECT c.*, d.numero_suivi, d.type_local, d.motif, u.prenom, u.nom
                FROM {$this->table} c
                JOIN demandes d ON c.demande_id = d.id
                JOIN utilisateurs u ON d.user_id = u.id
                WHERE c.statut = 'avis_emis'
                ORDER BY c.date_avis DESC";
        return $this->db->query($sql)->fetchAll();
    }
}
