<?php
// ============================================
// ПРОВЕРЬТЕ ЭТИ ДАННЫЕ В PHPMYADMIN!
// ============================================
$db_host = 'localhost';
$db_name = 'gagureqa_Luna';
$db_user = 'gagureqa_Luna';  // ← Посмотрите в phpMyAdmin вверху справа!
$db_pass = 'Heketakotik660!';  // ← Ваш пароль от базы данных

try {
    $pdo = new PDO(
        "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    // Создание таблицы пользователей
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        cart TEXT DEFAULT NULL,
        favorites TEXT DEFAULT NULL,
        orders TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Проверяем, есть ли тестовый пользователь
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = 'demo@luna-aurea.com'");
    $stmt->execute();
    if (!$stmt->fetch()) {
        $hashed = password_hash('demo123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password, cart, favorites, orders) VALUES ('DemoUser', 'demo@luna-aurea.com', ?, '[]', '[]', '[]')");
        $stmt->execute([$hashed]);
    }
    
} catch(PDOException $e) {
    // Ошибка подключения - логируем, но не выводим
    error_log('DB Error: ' . $e->getMessage());
    $pdo = null;
}
?>