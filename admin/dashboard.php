<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: index.php');
    exit;
}

require_once __DIR__ . '/../api/config/database.php';

// Получаем статистику
$stats = [
    'products' => 0,
    'orders' => 0,
    'messages_unread' => 0,
    'messages_total' => 0
];

if ($pdo) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM products");
        $stats['products'] = $stmt->fetchColumn();
        
        $stmt = $pdo->query("SELECT COUNT(*), SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) FROM messages");
        $row = $stmt->fetch();
        $stats['messages_total'] = (int)$row[0];
        $stats['messages_unread'] = (int)$row[1];
        
        $stmt = $pdo->query("SELECT orders FROM users WHERE orders IS NOT NULL AND orders != '[]'");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($users as $user) {
            $orders = json_decode($user['orders'], true);
            if (is_array($orders)) {
                $stats['orders'] += count($orders);
            }
        }
    } catch (PDOException $e) {}
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Админ-панель | Luna Aurea</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; }
        .header {
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .header-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }
        .logo { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: bold; color: #1f2937; }
        .logo span { font-size: 28px; }
        .user-info { display: flex; align-items: center; gap: 20px; }
        .logout { color: #ef4444; text-decoration: none; padding: 8px 16px; border: 1px solid #ef4444; border-radius: 8px; transition: all 0.3s; }
        .logout:hover { background: #ef4444; color: white; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .welcome {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 20px;
            margin-bottom: 30px;
        }
        .welcome h1 { font-size: 28px; margin-bottom: 10px; }
        .welcome p { opacity: 0.9; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
            text-decoration: none;
            color: inherit;
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .stat-icon { font-size: 48px; }
        .stat-info { flex: 1; }
        .stat-number { font-size: 32px; font-weight: bold; color: #1f2937; }
        .stat-label { color: #6b7280; font-size: 14px; margin-top: 5px; }
        .stat-card.products .stat-icon { color: #3b82f6; }
        .stat-card.orders .stat-icon { color: #f59e0b; }
        .stat-card.messages .stat-icon { color: #10b981; }
        .stat-card.unread .stat-icon { color: #ef4444; }
        .modules {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .module {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .module:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .module-header {
            padding: 20px;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .module-header .icon { font-size: 32px; }
        .module-header h2 { font-size: 18px; color: #1f2937; }
        .module-body { padding: 20px; }
        .module-body p { color: #6b7280; margin-bottom: 20px; line-height: 1.5; }
        .module-link {
            display: inline-block;
            padding: 10px 20px;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            transition: background 0.2s;
        }
        .module-link:hover { background: #2563eb; }
        .footer { text-align: center; padding: 30px; color: #9ca3af; font-size: 14px; }
        @media (max-width: 768px) {
            .stat-card { padding: 15px; }
            .stat-icon { font-size: 32px; }
            .stat-number { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <div class="logo"><span></span><span>Luna Aurea Admin</span></div>
            <div class="user-info">
                <span> Администратор</span>
                <a href="?logout=1" class="logout"> Выйти</a>
            </div>
        </div>
    </div>
    <div class="container">
        <div class="welcome">
            <h1>Добро пожаловать!</h1>
            <p>Управляйте товарами, заказами и сообщениями в одном месте</p>
        </div>
        <div class="stats-grid">
            <a href="products.php" class="stat-card products">
                <div class="stat-icon"></div>
                <div class="stat-info">
                    <div class="stat-number"><?= $stats['products'] ?></div>
                    <div class="stat-label">Товаров в каталоге</div>
                </div>
            </a>
            <a href="orders.php" class="stat-card orders">
                <div class="stat-icon"></div>
                <div class="stat-info">
                    <div class="stat-number"><?= $stats['orders'] ?></div>
                    <div class="stat-label">Всего заказов</div>
                </div>
            </a>
            <a href="messages.php" class="stat-card messages">
                <div class="stat-icon"></div>
                <div class="stat-info">
                    <div class="stat-number"><?= $stats['messages_total'] ?></div>
                    <div class="stat-label">Всего сообщений</div>
                </div>
            </a>
            <a href="messages.php?filter=unread" class="stat-card unread">
                <div class="stat-icon"></div>
                <div class="stat-info">
                    <div class="stat-number"><?= $stats['messages_unread'] ?></div>
                    <div class="stat-label">Непрочитанных</div>
                </div>
            </a>
        </div>
        <div class="modules">
            <div class="module">
                <div class="module-header"><div class="icon"></div><h2>Управление товарами</h2></div>
                <div class="module-body">
                    <p>Добавляйте, редактируйте и удаляйте товары. Управляйте ценами, категориями и изображениями.</p>
                    <a href="products.php" class="module-link">Перейти к товарам →</a>
                </div>
            </div>
            <div class="module">
                <div class="module-header"><div class="icon"></div><h2>Управление заказами</h2></div>
                <div class="module-body">
                    <p>Просматривайте заказы пользователей, меняйте статусы (в обработке, отправлен, завершён).</p>
                    <a href="orders.php" class="module-link">Перейти к заказам →</a>
                </div>
            </div>
            <div class="module">
                <div class="module-header"><div class="icon"></div><h2>Управление сообщениями</h2></div>
                <div class="module-body">
                    <p>Читайте сообщения от пользователей и отвечайте на них прямо из админки.</p>
                    <a href="messages.php" class="module-link">Перейти к сообщениям →</a>
                </div>
            </div>
        </div>
        <div class="footer">© 2024-2026 Luna Aurea | Административная панель</div>
    </div>
</body>
</html>
