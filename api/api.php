<?php
// ============================================
// API для интернет-магазина Luna Aurea
// ============================================

// Включаем вывод ошибок для отладки (потом отключить)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Заголовки для JSON и CORS
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Обработка preflight запросов (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Подключение к БД
require_once __DIR__ . '/config/database.php';

$dbConnected = isset($pdo) && $pdo !== null;

// Получаем маршрут
$route = $_GET['route'] ?? '';
$route = str_replace('auth/', '', $route);

// Функция для получения токена
function getAuthToken() {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!empty($authHeader) && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return $matches[1];
    }
    if (!empty($_GET['token'])) {
        return $_GET['token'];
    }
    return null;
}

// Функция для получения пользователя из токена
function getUserFromToken($token) {
    if (!$token) return null;
    $payload = json_decode(base64_decode($token), true);
    if (!$payload || !isset($payload['id'])) return null;
    return $payload;
}

// ============================================
// ПУБЛИЧНЫЕ МАРШРУТЫ (не требуют токена)
// ============================================

// Проверка работы API
if ($route === 'test') {
    echo json_encode([
        'status' => 'ok',
        'message' => 'API работает',
        'db_connected' => $dbConnected,
        'time' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// Статус БД
if ($route === 'dbstatus') {
    echo json_encode([
        'connected' => $dbConnected,
        'message' => $dbConnected ? 'Database connected' : 'Database NOT connected'
    ]);
    exit;
}

// РЕГИСТРАЦИЯ
if ($route === 'register') {
    // Получаем данные из POST (JSON) или GET
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($input && is_array($input)) {
        $username = trim($input['username'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
    } else {
        $username = trim($_GET['username'] ?? '');
        $email = trim($_GET['email'] ?? '');
        $password = $_GET['password'] ?? '';
    }
    
    // Валидация
    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'error' => 'Все поля обязательны']);
        exit;
    }
    
    if (strlen($password) < 6) {
        echo json_encode(['success' => false, 'error' => 'Пароль должен быть не менее 6 символов']);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'error' => 'Некорректный email']);
        exit;
    }
    
    // Если нет БД - демо-режим (для
