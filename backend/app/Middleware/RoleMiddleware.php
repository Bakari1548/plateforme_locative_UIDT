<?php

namespace App\Middleware;

use App\Config\Roles;

class RoleMiddleware extends AuthMiddleware
{
    private array $allowedRoles;

    public function __construct(array $allowedRoles)
    {
        $this->allowedRoles = $allowedRoles;
    }

    public function handle(): bool
    {
        if (!parent::handle()) {
            return false;
        }

        $userRole = $this->getUserRole();

        if (!in_array($userRole, $this->allowedRoles)) {
            $this->sendJsonError(403, 'Permissions insuffisantes');
        }

        return true;
    }

    public function hasPermission(string $permission): bool
    {
        $userRole = $this->getUserRole();
        return Roles::hasPermission($userRole, $permission);
    }
}
