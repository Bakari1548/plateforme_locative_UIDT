<?php

use App\Controllers\AuthController;
use App\Controllers\UserController;
use App\Controllers\DemandeController;
use App\Controllers\CommissionController;
use App\Controllers\ContratController;
use App\Controllers\LocalController;
use App\Controllers\PaiementController;
use App\Controllers\IncidentController;
use App\Controllers\QHSEController;
use App\Controllers\NotificationController;
use App\Controllers\DashboardController;
use App\Controllers\CourrierController;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Config\Roles;

// Initialize controllers
$authController = new AuthController();
$userController = new UserController();
$demandeController = new DemandeController();
$commissionController = new CommissionController();
$contratController = new ContratController();
$localController = new LocalController();
$paiementController = new PaiementController();
$incidentController = new IncidentController();
$qhseController = new QHSEController();
$notificationController = new NotificationController();
$dashboardController = new DashboardController();
$courrierController = new CourrierController();

// Public routes
$router->post('/api/auth/register', function() use ($router, $authController) {
    $data = $router->getJsonInput();
    $result = $authController->register($data);
    $router->sendJson($result, isset($result['error']) ? 400 : 201);
});

$router->post('/api/auth/login', function() use ($router, $authController) {
    $data = $router->getJsonInput();
    $result = $authController->login($data);
    $router->sendJson($result, isset($result['error']) ? 401 : 200);
});

// Protected routes
$router->get('/api/auth/me', function() use ($router, $authController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $authController->me($middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 404 : 200);
});

// User management routes (admin only)
$router->get('/api/users', function() use ($router, $userController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::AGENT_COURRIER, Roles::SECRETAIRE_CSA, Roles::DIRECTEUR]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $userController->index();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/users/{id}', function($params) use ($router, $userController) {
    $middleware = new RoleMiddleware([Roles::ADMIN]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $userController->show((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 404 : 200);
});

$router->put('/api/users/{id}', function($params) use ($router, $userController) {
    $middleware = new RoleMiddleware([Roles::ADMIN]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $userController->update((int)$params[0], $data);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->delete('/api/users/{id}', function($params) use ($router, $userController) {
    $middleware = new RoleMiddleware([Roles::ADMIN]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $userController->delete((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->patch('/api/users/{id}/status', function($params) use ($router, $userController) {
    $middleware = new RoleMiddleware([Roles::ADMIN]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $userController->updateStatus((int)$params[0], $data['status']);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->patch('/api/users/{id}/role', function($params) use ($router, $userController) {
    $middleware = new RoleMiddleware([Roles::ADMIN]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $userController->updateRole((int)$params[0], $data['role']);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/users/search/{query}', function($params) use ($router, $userController) {
    $middleware = new RoleMiddleware([Roles::ADMIN]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $userController->search($params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/users/role/{role}', function($params) use ($router, $userController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::DIRECTEUR, Roles::SECRETAIRE_CSA, Roles::AGENT_COURRIER]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $userController->getByRole($params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

// Demandes routes
$router->post('/api/demandes', function() use ($router, $demandeController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $demandeController->create($middleware->getUserId(), $data);
    $router->sendJson($result, isset($result['error']) ? 400 : 201);
});

$router->get('/api/demandes', function() use ($router, $demandeController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $demandeController->index($middleware->getUserId(), $middleware->getUserRole());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/demandes/my', function() use ($router, $demandeController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $demandeController->getMyDemandes($middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/demandes/pending', function() use ($router, $demandeController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::SECRETAIRE_CSA]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $demandeController->getPendingInstruction();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/demandes/dcuv-instruction', function() use ($router, $demandeController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $demandeController->getForDCUVInstruction();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/demandes/recevables', function() use ($router, $demandeController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DIRECTEUR]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $demandeController->getRecevables();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/demandes/decided', function() use ($router, $demandeController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DIRECTEUR]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $demandeController->getDecided();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/demandes/stats', function() use ($router, $demandeController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::DIRECTEUR]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $demandeController->getStats();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/demandes/suivi/{numero}', function($params) use ($router, $demandeController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $demandeController->getByNumeroSuivi($params[0], $middleware->getUserId(), $middleware->getUserRole());
    $router->sendJson($result, isset($result['error']) ? 404 : 200);
});

$router->get('/api/demandes/{id}', function($params) use ($router, $demandeController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $demandeController->show((int)$params[0], $middleware->getUserId(), $middleware->getUserRole());
    $router->sendJson($result, isset($result['error']) ? 404 : 200);
});

$router->put('/api/demandes/{id}', function($params) use ($router, $demandeController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $demandeController->update((int)$params[0], $middleware->getUserId(), $middleware->getUserRole(), $data);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->post('/api/demandes/{id}/submit', function($params) use ($router, $demandeController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $demandeController->submit((int)$params[0], $middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->post('/api/demandes/{id}/documents', function($params) use ($router, $demandeController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $demandeController->uploadDocument(
        (int)$params[0],
        $middleware->getUserId(),
        $_FILES,
        $_POST
    );
    $router->sendJson($result, isset($result['error']) ? 400 : 201);
});

$router->get('/api/demandes/{id}/documents', function($params) use ($router, $demandeController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $demandeController->getDocuments(
        (int)$params[0],
        $middleware->getUserId(),
        $middleware->getUserRole()
    );
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->patch('/api/demandes/{id}/statut', function($params) use ($router, $demandeController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::DIRECTEUR, Roles::SECRETAIRE_CSA]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $demandeController->updateStatut((int)$params[0], $data['statut'], $middleware->getUserId(), $data['commentaire'] ?? null);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

// Commission routes
$router->post('/api/commissions', function() use ($router, $commissionController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::SECRETAIRE_CSA]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $commissionController->createForDemande((int)$data['demande_id'], $data);
    $router->sendJson($result, isset($result['error']) ? 400 : 201);
});

$router->get('/api/commissions', function() use ($router, $commissionController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::SECRETAIRE_CSA, Roles::DIRECTEUR]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $commissionController->getPending();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/commissions/avis', function() use ($router, $commissionController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::DIRECTEUR]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $commissionController->getWithAvis();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/commissions/{id}', function($params) use ($router, $commissionController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::SECRETAIRE_CSA, Roles::DIRECTEUR]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $commissionController->show((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 404 : 200);
});

$router->patch('/api/commissions/{id}/avis', function($params) use ($router, $commissionController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::SECRETAIRE_CSA]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $commissionController->emitAvis((int)$params[0], $data);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->patch('/api/commissions/{id}/statut', function($params) use ($router, $commissionController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::SECRETAIRE_CSA]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $commissionController->updateStatut((int)$params[0], $data['statut']);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->post('/api/commissions/{id}/membres', function($params) use ($router, $commissionController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::SECRETAIRE_CSA]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $commissionController->addMembre((int)$params[0], (int)$data['user_id']);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->delete('/api/commissions/{id}/membres/{userId}', function($params) use ($router, $commissionController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::SECRETAIRE_CSA]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $commissionController->removeMembre((int)$params[0], (int)$params[1]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

// Contrat routes
$router->get('/api/contrats', function() use ($router, $contratController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $contratController->index($middleware->getUserId(), $middleware->getUserRole());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/contrats/my', function() use ($router, $contratController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $contratController->getMyContrats($middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/contrats/brouillons', function() use ($router, $contratController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $contratController->getBrouillons();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->post('/api/contrats/{id}/send-directeur', function($params) use ($router, $contratController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $contratController->sendToDirecteur((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/contrats/pending', function() use ($router, $contratController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $contratController->getPendingSignature();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/contrats/active', function() use ($router, $contratController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::DIRECTEUR]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $contratController->getActive();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/contrats/stats', function() use ($router, $contratController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::DIRECTEUR]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $contratController->getStats();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/contrats/pending-directeur-validation', function() use ($router, $contratController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::DIRECTEUR]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $contratController->getPendingDirecteurValidation();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/contrats/{id}', function($params) use ($router, $contratController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $contratController->show((int)$params[0], $middleware->getUserId(), $middleware->getUserRole());
    $router->sendJson($result, isset($result['error']) ? 404 : 200);
});

$router->post('/api/contrats', function() use ($router, $contratController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $data = array_merge($_POST, $router->getJsonInput() ?? []);
    $result = $contratController->createFromDecision((int)$data['decision_id'], $data, $_FILES);
    $router->sendJson($result, isset($result['error']) ? 400 : 201);
});

$router->put('/api/contrats/{id}', function($params) use ($router, $contratController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $contratController->update((int)$params[0], $data);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->post('/api/contrats/{id}/send', function($params) use ($router, $contratController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $contratController->sendForSignature((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->post('/api/contrats/{id}/sign/locataire', function($params) use ($router, $contratController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $contratController->signByLocataire((int)$params[0], $middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->post('/api/contrats/{id}/sign/dcuv', function($params) use ($router, $contratController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $contratController->signByDcuv((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->post('/api/contrats/{id}/resilier', function($params) use ($router, $contratController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::DIRECTEUR]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $contratController->resiliate((int)$params[0], $data['motif'] ?? null);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->patch('/api/contrats/{id}/validate-directeur', function($params) use ($router, $contratController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DIRECTEUR]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $contratController->validateByDirecteur((int)$params[0], $middleware->getUserId(), $data);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/decisions/validated-without-contrat', function() use ($router, $contratController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $contratController->getValidatedDecisionsWithoutContrat();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

// Locaux routes
$router->get('/api/locaux', function() use ($router, $localController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $localController->index();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/locaux/available', function() use ($router, $localController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $localController->getAvailable();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/locaux/stats', function() use ($router, $localController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::DIRECTEUR]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $localController->getStats();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/locaux/type/{type}', function($params) use ($router, $localController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $localController->getByType($params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/locaux/zone/{zone}', function($params) use ($router, $localController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $localController->getByZone($params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/locaux/search/{query}', function($params) use ($router, $localController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $localController->search($params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/locaux/{id}', function($params) use ($router, $localController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $localController->show((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 404 : 200);
});

$router->post('/api/locaux', function() use ($router, $localController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $localController->create($data);
    $router->sendJson($result, isset($result['error']) ? 400 : 201);
});

$router->put('/api/locaux/{id}', function($params) use ($router, $localController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $localController->update((int)$params[0], $data);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->delete('/api/locaux/{id}', function($params) use ($router, $localController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $localController->delete((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->patch('/api/locaux/{id}/statut', function($params) use ($router, $localController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $localController->updateStatut((int)$params[0], $data['statut']);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

// Transferts routes
$router->post('/api/transferts', function() use ($router, $localController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::LOCATAIRE]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $localController->createTransfert($data, $middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 201);
});

$router->get('/api/transferts/my', function() use ($router, $localController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $localController->getMyTransferts($middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/transferts/pending', function() use ($router, $localController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $localController->getPendingTransferts();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->patch('/api/transferts/{id}', function($params) use ($router, $localController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $localController->validateTransfert((int)$params[0], $middleware->getUserId(), $data['statut']);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/locaux/{id}/transferts', function($params) use ($router, $localController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $localController->getTransfertHistory((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

// Paiements routes
$router->get('/api/paiements', function() use ($router, $paiementController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $paiementController->index($middleware->getUserId(), $middleware->getUserRole());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/paiements/my', function() use ($router, $paiementController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $paiementController->getMyPaiements($middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->post('/api/paiements/my', function() use ($router, $paiementController) {
    $middleware = new RoleMiddleware([Roles::LOCATAIRE, Roles::ADMIN]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $paiementController->recordByLocataire($data, $middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 201);
});

$router->get('/api/paiements/stats', function() use ($router, $paiementController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::AGENT_RECOUV, Roles::DCUV, Roles::DIRECTEUR]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $paiementController->getStats();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/paiements/overdue', function() use ($router, $paiementController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::AGENT_RECOUV, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $paiementController->getOverdue();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/paiements/month/{mois}/{annee}', function($params) use ($router, $paiementController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::AGENT_RECOUV, Roles::DCUV, Roles::DIRECTEUR]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $paiementController->getByMonth((int)$params[0], (int)$params[1]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/paiements/contrat/{contratId}', function($params) use ($router, $paiementController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $paiementController->getByContrat((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/paiements/{id}', function($params) use ($router, $paiementController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $paiementController->show((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 404 : 200);
});

$router->post('/api/paiements', function() use ($router, $paiementController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::AGENT_RECOUV]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $paiementController->record($data, $middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 201);
});

// Quittances routes
$router->get('/api/quittances/my', function() use ($router, $paiementController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $paiementController->getMyQuittances($middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/quittances/{paiementId}', function($params) use ($router, $paiementController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $paiementController->getQuittance((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 404 : 200);
});

// Echeances routes
$router->get('/api/echeances/contrat/{contratId}', function($params) use ($router, $paiementController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $paiementController->getEcheancesByContrat((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->post('/api/echeances/generate/{contratId}', function($params) use ($router, $paiementController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::AGENT_RECOUV, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $paiementController->generateEcheances((int)$params[0], $data);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

// Incidents routes
$router->get('/api/incidents', function() use ($router, $incidentController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $incidentController->index($middleware->getUserId(), $middleware->getUserRole());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/incidents/pending', function() use ($router, $incidentController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::TECHNICIEN]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $incidentController->getPending();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/incidents/active', function() use ($router, $incidentController) {
    $middleware = new RoleMiddleware([Roles::TECHNICIEN, Roles::ADMIN]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $incidentController->getActiveForTechnicien($middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/incidents/stats', function() use ($router, $incidentController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $incidentController->getStats();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/incidents/{id}', function($params) use ($router, $incidentController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $incidentController->show((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 404 : 200);
});

$router->post('/api/incidents', function() use ($router, $incidentController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $incidentController->create($middleware->getUserId(), $data);
    $router->sendJson($result, isset($result['error']) ? 400 : 201);
});

$router->patch('/api/incidents/{id}/validate', function($params) use ($router, $incidentController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $incidentController->validate((int)$params[0], $middleware->getUserId(), $data);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->patch('/api/incidents/{id}/assign', function($params) use ($router, $incidentController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $incidentController->assignTechnicien((int)$params[0], (int)$data['technicien_id']);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->patch('/api/incidents/{id}/statut', function($params) use ($router, $incidentController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::TECHNICIEN]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $incidentController->updateStatut((int)$params[0], $data['statut']);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

// Interventions routes
$router->get('/api/interventions/my', function() use ($router, $incidentController) {
    $middleware = new RoleMiddleware([Roles::TECHNICIEN, Roles::ADMIN]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $incidentController->getMyInterventions($middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/interventions/incident/{incidentId}', function($params) use ($router, $incidentController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $incidentController->getInterventionsByIncident((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->post('/api/interventions', function() use ($router, $incidentController) {
    $middleware = new RoleMiddleware([Roles::TECHNICIEN, Roles::ADMIN]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $incidentController->createIntervention((int)$data['incident_id'], $middleware->getUserId(), $data);
    $router->sendJson($result, isset($result['error']) ? 400 : 201);
});

$router->patch('/api/interventions/{id}/complete', function($params) use ($router, $incidentController) {
    $middleware = new RoleMiddleware([Roles::TECHNICIEN, Roles::ADMIN]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $incidentController->completeIntervention((int)$params[0], $data);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/interventions/all', function() use ($router, $incidentController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $incidentController->getAllInterventions();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

// QHSE - Controles routes
$router->get('/api/controles-qhse', function() use ($router, $qhseController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $qhseController->indexControles($middleware->getUserId(), $middleware->getUserRole());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/controles-qhse/pending', function() use ($router, $qhseController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $qhseController->getPendingControles();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/controles-qhse/completed', function() use ($router, $qhseController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $qhseController->getCompletedControles();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/controles-qhse/stats', function() use ($router, $qhseController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $qhseController->getControleStats();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/controles-qhse/{id}', function($params) use ($router, $qhseController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $qhseController->showControle((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 404 : 200);
});

$router->post('/api/controles-qhse', function() use ($router, $qhseController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $qhseController->createControle($middleware->getUserId(), $data);
    $router->sendJson($result, isset($result['error']) ? 400 : 201);
});

$router->patch('/api/controles-qhse/{id}/scores', function($params) use ($router, $qhseController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $qhseController->recordScores((int)$params[0], $data);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

// QHSE - Sanctions routes
$router->get('/api/sanctions', function() use ($router, $qhseController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $qhseController->indexSanctions($middleware->getUserId(), $middleware->getUserRole());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/sanctions/active', function() use ($router, $qhseController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $qhseController->getActiveSanctions();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/sanctions/stats', function() use ($router, $qhseController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $qhseController->getSanctionStats();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/sanctions/{id}', function($params) use ($router, $qhseController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $qhseController->showSanction((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 404 : 200);
});

$router->post('/api/sanctions', function() use ($router, $qhseController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $qhseController->createSanction($middleware->getUserId(), $data);
    $router->sendJson($result, isset($result['error']) ? 400 : 201);
});

$router->patch('/api/sanctions/{id}/lever', function($params) use ($router, $qhseController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $qhseController->leverSanction((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

// Notifications routes
$router->get('/api/notifications', function() use ($router, $notificationController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $notificationController->index($middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/notifications/unread', function() use ($router, $notificationController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $notificationController->getUnread($middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->patch('/api/notifications/{id}/read', function($params) use ($router, $notificationController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $notificationController->markAsRead((int)$params[0], $middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->patch('/api/notifications/read-all', function() use ($router, $notificationController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $notificationController->markAllAsRead($middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->post('/api/notifications', function() use ($router, $notificationController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $notificationController->create($data);
    $router->sendJson($result, isset($result['error']) ? 400 : 201);
});

// Dashboard routes
$router->get('/api/dashboard', function() use ($router, $dashboardController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $dashboardController->getForRole($middleware->getUserId(), $middleware->getUserRole());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/dashboard/global', function() use ($router, $dashboardController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DIRECTEUR]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $dashboardController->getGlobal();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

// Courriers routes
$router->get('/api/courriers', function() use ($router, $courrierController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $courrierController->index($middleware->getUserId(), $middleware->getUserRole());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/courriers/sent', function() use ($router, $courrierController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $courrierController->getSent($middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/courriers/received', function() use ($router, $courrierController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $courrierController->getReceived($middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/courriers/unread', function() use ($router, $courrierController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $courrierController->getUnread($middleware->getUserId());
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/courriers/demande/{demandeId}', function($params) use ($router, $courrierController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $courrierController->getByDemande((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/courriers/{id}', function($params) use ($router, $courrierController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $courrierController->show((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 404 : 200);
});

$router->post('/api/courriers', function() use ($router, $courrierController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::AGENT_COURRIER, Roles::SECRETAIRE_CSA]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $courrierController->create($middleware->getUserId(), $data);
    $router->sendJson($result, isset($result['error']) ? 400 : 201);
});

$router->patch('/api/courriers/{id}/send', function($params) use ($router, $courrierController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV, Roles::AGENT_COURRIER, Roles::SECRETAIRE_CSA]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $courrierController->send((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->patch('/api/courriers/{id}/read', function($params) use ($router, $courrierController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $courrierController->markAsRead((int)$params[0]);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});
