<?php
// ============================================
// ТОЛЬКО ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ
// ============================================
$db_host = 'localhost';
$db_name = 'gagureqa_Luna';
$db_user = 'gagureqa_Luna';
$db_pass = 'Heketakotik660!';

$pdo = null;
try {
    $pdo = new PDO(
        "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    // Таблица messages, если её ещё нет
    $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        message TEXT NOT NULL,
        type ENUM('contact', 'support') DEFAULT 'contact',
        created_at DATETIME NOT NULL,
        is_read BOOLEAN DEFAULT FALSE
    )");
    
} catch(PDOException $e) {
    error_log('DB connection error: ' . $e->getMessage());
    $pdo = null;
}
?>