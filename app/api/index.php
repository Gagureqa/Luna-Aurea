<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: *");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/database.php';

$route = $_GET['route'] ?? '';
$route = str_replace('auth/', '', $route);
$dbConnected = isset($pdo) && $pdo !== null;

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

function getUserFromToken() {
    $token = getAuthToken();
    if (!$token) return null;
    $payload = json_decode(base64_decode($token), true);
    if (!$payload || !isset($payload['id'])) return null;
    return $payload;
}

// ---------- Публичные маршруты ----------
if ($route === 'dbstatus') {
    echo json_encode(['connected' => $dbConnected, 'message' => $dbConnected ? 'Database connected' : 'Database NOT connected']);
    exit;
}
if ($route === 'test') {
    echo json_encode(['status' => 'ok', 'message' => 'API works', 'db_connected' => $dbConnected]);
    exit;
}
if ($route === 'register') {
    $username = $_GET['username'] ?? '';
    $email = $_GET['email'] ?? '';
    $password = $_GET['password'] ?? '';
    if (empty($username) || empty($email) || empty($password)) { echo json_encode(['error' => 'All fields are required']); exit; }
    if (strlen($password) < 6) { echo json_encode(['error' => 'Password must be at least 6 characters']); exit; }
    if (!$dbConnected) { echo json_encode(['success' => true, 'token' => base64_encode(json_encode(['id' => 1, 'email' => $email])), 'user' => ['id' => 1, 'username' => $username, 'email' => $email, 'cart' => [], 'favorites' => [], 'orders' => [], 'created_at' => date('Y-m-d H:i:s')]]); exit; }
    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?"); $stmt->execute([$email]);
        if ($stmt->fetch()) { echo json_encode(['error' => 'User already exists']); exit; }
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password, cart, favorites, orders) VALUES (?, ?, ?, '[]', '[]', '[]')");
        $stmt->execute([$username, $email, $hashed]);
        $userId = $pdo->lastInsertId();
        $token = base64_encode(json_encode(['id' => $userId, 'email' => $email]));
        echo json_encode(['success' => true, 'token' => $token, 'user' => ['id' => $userId, 'username' => $username, 'email' => $email, 'cart' => [], 'favorites' => [], 'orders' => [], 'created_at' => date('Y-m-d H:i:s')]]);
    } catch (PDOException $e) { echo json_encode(['error' => 'DB error: ' . $e->getMessage()]); }
    exit;
}
if ($route === 'login') {
    $email = $_GET['email'] ?? '';
    $password = $_GET['password'] ?? '';
    if (empty($email) || empty($password)) { echo json_encode(['error' => 'Email and password required']); exit; }
    if (!$dbConnected) { echo json_encode(['success' => true, 'token' => base64_encode(json_encode(['id' => 1, 'email' => $email])), 'user' => ['id' => 1, 'username' => 'DemoUser', 'email' => $email, 'cart' => [], 'favorites' => [], 'orders' => [], 'created_at' => date('Y-m-d H:i:s')]]); exit; }
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?"); $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user || !password_verify($password, $user['password'])) { echo json_encode(['error' => 'Неверный логин/пароль или вы не зарегистрированы']); exit; }
        $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?"); $stmt->execute([$user['id']]);
        $token = base64_encode(json_encode(['id' => $user['id'], 'email' => $user['email']]));
        $userCart = !empty($user['cart']) ? json_decode($user['cart'], true) : [];
        $userFavorites = !empty($user['favorites']) ? json_decode($user['favorites'], true) : [];
        $userOrders = !empty($user['orders']) ? json_decode($user['orders'], true) : [];
        echo json_encode(['success' => true, 'token' => $token, 'user' => ['id' => $user['id'], 'username' => $user['username'], 'email' => $user['email'], 'cart' => $userCart, 'favorites' => $userFavorites, 'orders' => $userOrders, 'created_at' => $user['created_at']]]);
    } catch (PDOException $e) { echo json_encode(['error' => 'DB error: ' . $e->getMessage()]); }
    exit;
}

// ---------- Защищённые маршруты ----------
$payload = getUserFromToken();
if (!$payload) { echo json_encode(['error' => 'Unauthorized']); exit; }
$userId = $payload['id'];

if ($route === 'cart' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!$dbConnected) { echo json_encode(['cart' => []]); exit; }
    $stmt = $pdo->prepare("SELECT cart FROM users WHERE id = ?"); $stmt->execute([$userId]);
    $cart = $stmt->fetchColumn();
    echo json_encode(['cart' => $cart ? json_decode($cart, true) : []]);
    exit;
}
if ($route === 'cart' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $items = $input['items'] ?? [];
    if (!$dbConnected) { echo json_encode(['success' => true]); exit; }
    $stmt = $pdo->prepare("UPDATE users SET cart = ? WHERE id = ?");
    $stmt->execute([json_encode($items, JSON_UNESCAPED_UNICODE), $userId]);
    echo json_encode(['success' => true]);
    exit;
}

if ($route === 'favorites' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!$dbConnected) { echo json_encode(['favorites' => []]); exit; }
    $stmt = $pdo->prepare("SELECT favorites FROM users WHERE id = ?"); $stmt->execute([$userId]);
    $fav = $stmt->fetchColumn();
    echo json_encode(['favorites' => $fav ? json_decode($fav, true) : []]);
    exit;
}
if ($route === 'favorites' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $items = $input['items'] ?? [];
    if (!$dbConnected) { echo json_encode(['success' => true]); exit; }
    $stmt = $pdo->prepare("UPDATE users SET favorites = ? WHERE id = ?");
    $stmt->execute([json_encode($items, JSON_UNESCAPED_UNICODE), $userId]);
    echo json_encode(['success' => true]);
    exit;
}

if ($route === 'orders' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!$dbConnected) { echo json_encode(['orders' => []]); exit; }
    $stmt = $pdo->prepare("SELECT orders FROM users WHERE id = ?"); $stmt->execute([$userId]);
    $orders = $stmt->fetchColumn();
    echo json_encode(['orders' => $orders ? json_decode($orders, true) : []]);
    exit;
}
if ($route === 'orders' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$dbConnected) { echo json_encode(['success' => true]); exit; }
    $stmt = $pdo->prepare("SELECT orders FROM users WHERE id = ?"); $stmt->execute([$userId]);
    $currentOrders = $stmt->fetchColumn();
    $ordersArray = $currentOrders ? json_decode($currentOrders, true) : [];
    // Сохраняем ID, который прислал фронт (строка)
    $newOrderId = isset($input['id']) ? (string)$input['id'] : (string)time();
    $newOrder = [
        'id' => $newOrderId,
        'date' => $input['date'] ?? date('Y-m-d H:i:s'),
        'items' => $input['items'] ?? [],
        'total' => $input['total'] ?? 0,
        'status' => 'pending',
        'address' => $input['address'] ?? '',
        'phone' => $input['phone'] ?? '',
        'payment' => $input['payment'] ?? 'card',
        'cardNumber' => $input['cardNumber'] ?? ''
    ];
    $ordersArray[] = $newOrder;
    $stmt = $pdo->prepare("UPDATE users SET orders = ? WHERE id = ?");
    $stmt->execute([json_encode($ordersArray, JSON_UNESCAPED_UNICODE), $userId]);
    echo json_encode(['success' => true, 'order' => $newOrder]);
    exit;
}

// ---------- ОТМЕНА ЗАКАЗА (исправленное сравнение) ----------
if ($route === 'cancel-order' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    if (!$dbConnected) {
        echo json_encode(['error' => 'База данных недоступна']);
        exit;
    }
    $input = json_decode(file_get_contents('php://input'), true);
    $orderId = $input['orderId'] ?? null;
    if (!$orderId) {
        echo json_encode(['error' => 'Не указан ID заказа']);
        exit;
    }
    $orderIdStr = (string)$orderId;
    
    $stmt = $pdo->prepare("SELECT orders FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $currentOrders = $stmt->fetchColumn();
    $ordersArray = $currentOrders ? json_decode($currentOrders, true) : [];
    
    $found = false;
    foreach ($ordersArray as &$order) {
        // Сравниваем как строки, чтобы работали и числа, и строки
        if ((string)$order['id'] === $orderIdStr) {
            if ($order['status'] === 'cancelled') {
                echo json_encode(['error' => 'Заказ уже отменён']);
                exit;
            }
            if ($order['status'] !== 'pending' && $order['status'] !== 'processing') {
                echo json_encode(['error' => 'Невозможно отменить заказ, который уже обрабатывается или отправлен']);
                exit;
            }
            $order['status'] = 'cancelled';
            $found = true;
            break;
        }
    }
    
    if (!$found) {
        echo json_encode(['error' => 'Заказ не найден']);
        exit;
    }
    
    $stmt = $pdo->prepare("UPDATE users SET orders = ? WHERE id = ?");
    $stmt->execute([json_encode($ordersArray, JSON_UNESCAPED_UNICODE), $userId]);
    echo json_encode(['success' => true, 'message' => 'Заказ отменён']);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Route not found', 'route' => $route]);