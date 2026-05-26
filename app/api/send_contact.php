<?php
// api/send_contact.php – исправленная версия
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

$type = $input['type'] ?? 'contact';
$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$message = trim($input['message'] ?? '');
$phone = trim($input['phone'] ?? '');

if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(['success' => false, 'error' => 'Имя, email и сообщение обязательны']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Некорректный email']);
    exit;
}

global $pdo;
$saved = false;

if ($pdo) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO messages (name, email, phone, message, type, created_at, is_read) 
            VALUES (?, ?, ?, ?, ?, NOW(), 0)
        ");
        $saved = $stmt->execute([$name, $email, $phone, $message, $type]);
    } catch (PDOException $e) {
        error_log("DB insert error: " . $e->getMessage());
    }
}

if ($saved) {
    // Пытаемся отправить email, но не блокируем ответ
    $to = 'luna.aureaa@gmail.com';
$headers = "From: $email\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();
$headers .= "MIME-Version: 1.0\r\n";
mail($to, $subject, $body, $headers, "-f $email");
    
    echo json_encode(['success' => true, 'message' => 'Сообщение сохранено. Мы ответим вам в ближайшее время.']);
} else {
    echo json_encode(['success' => false, 'error' => 'Не удалось сохранить сообщение. Попробуйте позже.']);
}