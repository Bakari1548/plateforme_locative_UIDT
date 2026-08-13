<?php

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Load environment variables
if (file_exists(__DIR__ . '/../../.env')) {
    $lines = file(__DIR__ . '/../../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

// Autoload
require_once __DIR__ . '/../../vendor/autoload.php';

// Initialize database
require_once __DIR__ . '/../config/database.php';
App\Config\Database::init();

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load router
require_once __DIR__ . '/../app/Router.php';

$router = new App\Router();

// Health check route
$router->get('/api/health', function() use ($router) {
    $router->sendJson([
        'status' => 'ok',
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0.0'
    ]);
});

// API routes
require_once __DIR__ . '/../routes/api.php';

// Dispatch the router
$router->dispatch();
