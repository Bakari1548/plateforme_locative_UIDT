<?php

namespace App\Config;

class Roles
{
    // Rôles disponibles
    public const VISITEUR = 'visiteur';
    public const LOCATAIRE = 'locataire';
    public const DCUV = 'dcuv';
    public const DIRECTEUR = 'directeur';
    public const TECHNICIEN = 'technicien';
    public const AGENT_RECOUV = 'agentRecouv';
    public const AGENT_COURRIER = 'agentCourrier';
    public const SECRETAIRE_CSA = 'secretaireCSA';
    public const ADMIN = 'admin';

    // Permissions par module (aligné RACI)
    public static function getPermissions(): array
    {
        return [
            self::VISITEUR => [
                'demandes.create' => true,
                'public.view' => true,
            ],
            self::LOCATAIRE => [
                'demandes.create' => true,
                'demandes.view_own' => true,
                'contrats.view_own' => true,
                'contrats.sign' => true,
                'paiements.view_own' => true,
                'incidents.create' => true,
                'incidents.view_own' => true,
                'scores.view_own' => true,
            ],
            self::DCUV => [
                'demandes.view_all' => true,
                'demandes.instruct' => true,
                'demandes.request_complements' => true,
                'contrats.view_all' => true,
                'contrats.manage' => true,
                'locaux.manage' => true,
                'locaux.view' => true,
                'incidents.view_all' => true,
                'incidents.validate' => true,
                'controles_qhse.create' => true,
                'controles_qhse.view' => true,
                'sanctions.create' => true,
                'sanctions.view' => true,
            ],
            self::DIRECTEUR => [
                'decisions.validate' => true,
                'decisions.view' => true,
                'contrats.approve' => true,
                'dashboard.view_global' => true,
                'users.manage' => true,
            ],
            self::TECHNICIEN => [
                'incidents.view_assigned' => true,
                'interventions.create' => true,
                'interventions.update' => true,
            ],
            self::AGENT_RECOUV => [
                'paiements.record' => true,
                'paiements.view_all' => true,
                'quittances.generate' => true,
                'relances.send' => true,
                'dashboard.view_recouvrement' => true,
            ],
            self::AGENT_COURRIER => [
                'courriers.manage' => true,
                'courriers.view' => true,
            ],
            self::SECRETAIRE_CSA => [
                'commissions.view' => true,
                'commissions.manage' => true,
            ],
            self::ADMIN => [
                'users.manage' => true,
                'users.view_all' => true,
                'config.manage' => true,
                'imports.execute' => true,
                'notifications.manage' => true,
                'dashboard.view_global' => true,
            ],
        ];
    }

    public static function hasPermission(string $role, string $permission): bool
    {
        $permissions = self::getPermissions();
        return $permissions[$role][$permission] ?? false;
    }

    public static function getAllRoles(): array
    {
        return [
            self::VISITEUR,
            self::LOCATAIRE,
            self::DCUV,
            self::DIRECTEUR,
            self::TECHNICIEN,
            self::AGENT_RECOUV,
            self::AGENT_COURRIER,
            self::SECRETAIRE_CSA,
            self::ADMIN,
        ];
    }
}
