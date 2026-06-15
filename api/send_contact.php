<?php
// api/send_contact.php – исправленная версия с защитой от дублирования
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
$ip = $_SERVER['REMOTE_ADDR'] ?? '';

if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(['success' => false, 'error' => 'Имя, email и сообщение обязательны']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Некорректный email']);
    exit;
}

if (!$pdo) {
    echo json_encode(['success' => false, 'error' => 'Нет подключения к базе данных']);
    exit;
}

try {
    // ============================================
    // ЗАЩИТА ОТ ДУБЛИРОВАНИЯ
    // ============================================
    
    // 1. Проверяем дубликат по email + message за последние 60 секунд
    $stmt = $pdo->prepare("
        SELECT COUNT(*) FROM messages 
        WHERE email = ? AND message = ? AND created_at > DATE_SUB(NOW(), INTERVAL 60 SECOND)
    ");
    $stmt->execute([$email, $message]);
    $duplicateCount = $stmt->fetchColumn();
    
    if ($duplicateCount > 0) {
        echo json_encode([
            'success' => false, 
            'error' => 'Вы уже отправляли это сообщение. Пожалуйста, подождите минуту.'
        ]);
        exit;
    }
    
    // 2. Проверяем дубликат по IP за последние 30 секунд
    if ($ip) {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM messages 
            WHERE ip = ? AND created_at > DATE_SUB(NOW(), INTERVAL 30 SECOND)
        ");
        $stmt->execute([$ip]);
        $ipCount = $stmt->fetchColumn();
        
        if ($ipCount > 0) {
            echo json_encode([
                'success' => false, 
                'error' => 'Слишком частая отправка. Пожалуйста, подождите 30 секунд.'
            ]);
            exit;
        }
    }
    
    // 3. Проверяем лимит на час (не более 5 сообщений с одного IP)
    if ($ip) {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM messages 
            WHERE ip = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ");
        $stmt->execute([$ip]);
        $hourlyCount = $stmt->fetchColumn();
        
        if ($hourlyCount >= 5) {
            echo json_encode([
                'success' => false, 
                'error' => 'Лимит сообщений: не более 5 в час. Попробуйте позже.'
            ]);
            exit;
        }
    }
    
    // ============================================
    // СОХРАНЕНИЕ СООБЩЕНИЯ
    // ============================================
    
    // Проверяем, есть ли колонка ip, если нет - добавляем
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM messages LIKE 'ip'");
        $hasIpColumn = $stmt->rowCount() > 0;
        if (!$hasIpColumn) {
            $pdo->exec("ALTER TABLE messages ADD COLUMN ip VARCHAR(45) DEFAULT NULL");
        }
    } catch (PDOException $e) {
        // Колонка возможно уже есть
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO messages (name, email, phone, message, type, created_at, is_read, ip) 
        VALUES (?, ?, ?, ?, ?, NOW(), 0, ?)
    ");
    $saved = $stmt->execute([$name, $email, $phone, $message, $type, $ip]);
    
    if (!$saved) {
        echo json_encode(['success' => false, 'error' => 'Не удалось сохранить сообщение']);
        exit;
    }
    
    // ============================================
    // ОТПРАВКА УВЕДОМЛЕНИЯ АДМИНУ
    // ============================================
    
    $to = 'luna.aureaa@gmail.com';
    $subject = "=?UTF-8?B?" . base64_encode("Новое сообщение от $name") . "?=";
    
    $headers = "From: no-reply@luna-aurea.ru\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    $headers .= "MIME-Version: 1.0\r\n";
    
    $body = "Новое сообщение с сайта Luna Aurea\n\n";
    $body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    $body .= "Имя: $name\n";
    $body .= "Email: $email\n";
    if ($phone) $body .= "Телефон: $phone\n";
    $body .= "IP: $ip\n";
    $body .= "Тип: " . ($type === 'contact' ? 'Обычное' : 'По заказу') . "\n";
    $body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    $body .= "Сообщение:\n$message\n";
    
    @mail($to, $subject, $body, $headers);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Сообщение сохранено. Мы ответим вам в ближайшее время.'
    ]);
    
} catch (PDOException $e) {
    error_log("DB error in send_contact: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Ошибка базы данных: ' . $e->getMessage()]);
    exit;
}
?>
