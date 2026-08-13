<?php

use App\Controllers\AuthController;
use App\Controllers\UserController;
use App\Controllers\DemandeController;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Config\Roles;

// Initialize controllers
$authController = new AuthController();
$userController = new UserController();
$demandeController = new DemandeController();

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
    $middleware = new RoleMiddleware([Roles::ADMIN]);
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
    $middleware = new RoleMiddleware([Roles::ADMIN]);
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

$router->get('/api/demandes/{id}', function($params) use ($router, $demandeController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $demandeController->show((int)$params[0], $middleware->getUserId(), $middleware->getUserRole());
    $router->sendJson($result, isset($result['error']) ? 404 : 200);
});

$router->get('/api/demandes/suivi/{numero}', function($params) use ($router, $demandeController) {
    $middleware = new AuthMiddleware();
    if (!$middleware->handle()) {
        return;
    }
    $result = $demandeController->getByNumeroSuivi($params[0], $middleware->getUserId(), $middleware->getUserRole());
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

$router->patch('/api/demandes/{id}/statut', function($params) use ($router, $demandeController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $data = $router->getJsonInput();
    $result = $demandeController->updateStatut((int)$params[0], $data['statut'], $middleware->getUserId(), $data['commentaire'] ?? null);
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/demandes/pending', function() use ($router, $demandeController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $demandeController->getPendingInstruction();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});

$router->get('/api/demandes/stats', function() use ($router, $demandeController) {
    $middleware = new RoleMiddleware([Roles::ADMIN, Roles::DCUV]);
    if (!$middleware->handle()) {
        return;
    }
    $result = $demandeController->getStats();
    $router->sendJson($result, isset($result['error']) ? 400 : 200);
});
