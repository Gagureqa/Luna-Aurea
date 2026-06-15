<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: index.php');
    exit;
}

require_once __DIR__ . '/../api/config/database.php';

$message = '';
$error = '';

// Создаём таблицу replies если нет
if ($pdo) {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS replies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            message_id INT NOT NULL,
            reply_text TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
    } catch (PDOException $e) {}
}

// Обработка POST
if ($pdo && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'reply') {
        $message_id = (int)$_POST['message_id'];
        $reply_text = trim($_POST['reply_text']);
        $user_email = trim($_POST['user_email']);
        $user_name = trim($_POST['user_name']);
        
        if ($reply_text && $user_email) {
            try {
                $stmt = $pdo->prepare("INSERT INTO replies (message_id, reply_text, created_at) VALUES (?, ?, NOW())");
                $stmt->execute([$message_id, $reply_text]);
                $stmt = $pdo->prepare("UPDATE messages SET is_read = 1 WHERE id = ?");
                $stmt->execute([$message_id]);
                
                // Отправляем email
                $to = $user_email;
                $subject = "=?UTF-8?B?" . base64_encode("Ответ на ваше сообщение - Luna Aurea") . "?=";
                $headers = "From: no-reply@luna-aurea.ru\r\n";
                $headers .= "Reply-To: luna.aureaa@gmail.com\r\n";
                $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
                $headers .= "MIME-Version: 1.0\r\n";
                
                $body = "Здравствуйте, $user_name!\n\n";
                $body .= "Спасибо за ваше обращение. Вот ответ от нашей команды:\n\n";
                $body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
                $body .= "$reply_text\n";
                $body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
                $body .= "С уважением,\n";
                $body .= "Команда Luna Aurea\n";
                $body .= " https://luna-aurea.ru\n";
                
                @mail($to, $subject, $body, $headers);
                $message = "Ответ отправлен пользователю " . htmlspecialchars($user_email);
            } catch (PDOException $e) {
                $error = "Ошибка: " . $e->getMessage();
            }
        } else {
            $error = "Заполните текст ответа";
        }
        // После ответа перезагружаем страницу
        header('Location: messages.php');
        exit;
    } elseif ($action === 'delete') {
        $id = (int)$_POST['id'];
        try {
            $stmt = $pdo->prepare("DELETE FROM messages WHERE id = ?");
            $stmt->execute([$id]);
            $message = " Сообщение удалено";
            header('Location: messages.php');
            exit;
        } catch (PDOException $e) {
            $error = "Ошибка удаления: " . $e->getMessage();
        }
    } elseif ($action === 'mark_read') {
        $id = (int)$_POST['id'];
        try {
            $stmt = $pdo->prepare("UPDATE messages SET is_read = 1 WHERE id = ?");
            $stmt->execute([$id]);
            $message = " Сообщение отмечено как прочитанное";
            header('Location: messages.php');
            exit;
        } catch (PDOException $e) {
            $error = "Ошибка: " . $e->getMessage();
        }
    }
}

// Получаем сообщения
$messages = [];
if ($pdo) {
    try {
        $filter = $_GET['filter'] ?? '';
        if ($filter === 'unread') {
            $stmt = $pdo->prepare("SELECT * FROM messages WHERE is_read = 0 ORDER BY created_at DESC");
        } else {
            $stmt = $pdo->prepare("SELECT * FROM messages ORDER BY is_read ASC, created_at DESC");
        }
        $stmt->execute();
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Загружаем ответы для каждого сообщения
        foreach ($messages as $key => $msg) {
            $stmt2 = $pdo->prepare("SELECT * FROM replies WHERE message_id = ? ORDER BY created_at DESC");
            $stmt2->execute([$msg['id']]);
            $messages[$key]['replies'] = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        }
    } catch (PDOException $e) {
        $error = "Ошибка загрузки: " . $e->getMessage();
    }
}

$unread_count = 0;
foreach ($messages as $msg) {
    if ($msg['is_read'] == 0) $unread_count++;
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Управление сообщениями | Luna Aurea Admin</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; background: #f3f4f6; margin: 0; padding: 0; }
        .admin-header {
            background: white;
            border-bottom: 1px solid #e5e7eb;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .admin-header h1 { font-size: 20px; margin: 0; }
        .nav-links { display: flex; gap: 15px; align-items: center; flex-wrap: wrap; }
        .nav-links a { color: #4b5563; text-decoration: none; padding: 6px 12px; border-radius: 8px; transition: all 0.2s; }
        .nav-links a:hover { background: #f3f4f6; }
        .nav-links a.active { background: #3b82f6; color: white; }
        .logout { color: #ef4444 !important; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .alert { padding: 12px 16px; margin-bottom: 20px; border-radius: 10px; }
        .alert-success { background: #d1fae5; color: #065f46; border-left: 4px solid #10b981; }
        .alert-error { background: #fee2e2; color: #991b1b; border-left: 4px solid #ef4444; }
        .stats { display: flex; gap: 15px; margin: 20px 0; flex-wrap: wrap; }
        .stat-card { background: #f9fafb; padding: 15px 25px; border-radius: 12px; border-left: 4px solid #3b82f6; }
        .stat-number { font-size: 28px; font-weight: bold; color: #1f2937; }
        .stat-label { color: #6b7280; font-size: 14px; }
        .filters { margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap; }
        .filter-link { padding: 8px 16px; border-radius: 8px; text-decoration: none; background: #f3f4f6; color: #4b5563; }
        .filter-link.active { background: #3b82f6; color: white; }
        .message-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        .message-card.unread { border-left: 4px solid #ef4444; background: #fef2f2; }
        .message-card.read { border-left: 4px solid #10b981; }
        .message-header {
            padding: 15px 20px;
            background: #f9fafb;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
        }
        .message-header:hover { background: #f3f4f6; }
        .message-info { flex: 1; }
        .message-name { font-weight: bold; font-size: 16px; color: #1f2937; }
        .message-email { font-size: 13px; color: #6b7280; margin-top: 4px; }
        .message-phone { font-size: 12px; color: #9ca3af; margin-top: 2px; }
        .message-meta { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .badge-unread { background: #fee2e2; color: #dc2626; }
        .badge-read { background: #d1fae5; color: #059669; }
        .badge-contact { background: #dbeafe; color: #2563eb; }
        .badge-support { background: #fef3c7; color: #d97706; }
        .message-date { font-size: 12px; color: #9ca3af; }
        .message-body { padding: 20px; display: none; border-top: 1px solid #e5e7eb; }
        .message-body.show { display: block; }
        .message-text { background: #f9fafb; padding: 15px; border-radius: 12px; margin-bottom: 20px; line-height: 1.6; white-space: pre-wrap; }
        .replies-section { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        .reply-item { background: #f9fafb; padding: 12px; border-radius: 10px; margin-bottom: 10px; }
        .reply-text { white-space: pre-wrap; }
        .reply-date { font-size: 11px; color: #9ca3af; margin-top: 8px; }
        .reply-form { margin-top: 20px; }
        .reply-form textarea { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 10px; font-family: inherit; font-size: 14px; resize: vertical; }
        .btn { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-primary:hover { background: #2563eb; }
        .btn-success { background: #10b981; color: white; }
        .btn-danger { background: #ef4444; color: white; }
        .btn-sm { padding: 4px 10px; font-size: 12px; }
        .actions { display: flex; gap: 8px; margin-top: 15px; justify-content: flex-end; }
        .back-link { display: inline-block; margin-bottom: 20px; color: #3b82f6; text-decoration: none; }
        hr { margin: 20px 0; }
    </style>
</head>
<body>
    <div class="admin-header">
        <h1> Luna Aurea — Управление сообщениями</h1>
        <div class="nav-links">
            <a href="dashboard.php"> Главная</a>
            <a href="products.php"> Товары</a>
            <a href="orders.php"> Заказы</a>
            <a href="messages.php" class="active"> Сообщения</a>
            <a href="?logout=1" class="logout" onclick="return confirm('Выйти?')"> Выход</a>
        </div>
    </div>
    <div class="container">
        <a href="dashboard.php" class="back-link">← На главную</a>
        
        <?php if ($message): ?>
            <div class="alert alert-success"><?= htmlspecialchars($message) ?></div>
        <?php endif; ?>
        <?php if ($error): ?>
            <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>
        
        <div class="filters">
            <a href="messages.php" class="filter-link <?= !isset($_GET['filter']) ? 'active' : '' ?>"> Все сообщения</a>
            <a href="messages.php?filter=unread" class="filter-link <?= isset($_GET['filter']) && $_GET['filter'] === 'unread' ? 'active' : '' ?>"> Непрочитанные (<?= $unread_count ?>)</a>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number"><?= count($messages) ?></div>
                <div class="stat-label">Всего сообщений</div>
            </div>
            <div class="stat-card">
                <div class="stat-number"><?= $unread_count ?></div>
                <div class="stat-label">Непрочитанных</div>
            </div>
        </div>
        
        <?php if (empty($messages)): ?>
            <div class="alert" style="text-align:center;"> Нет сообщений от пользователей</div>
        <?php else: ?>
            <?php foreach ($messages as $msg): ?>
                <div class="message-card <?= $msg['is_read'] ? 'read' : 'unread' ?>">
                    <div class="message-header" onclick="toggleMessage(<?= $msg['id'] ?>)">
                        <div class="message-info">
                            <div class="message-name"> <?= htmlspecialchars($msg['name']) ?></div>
                            <div class="message-email"> <?= htmlspecialchars($msg['email']) ?></div>
                            <?php if (!empty($msg['phone'])): ?>
                                <div class="message-phone"> <?= htmlspecialchars($msg['phone']) ?></div>
                            <?php endif; ?>
                        </div>
                        <div class="message-meta">
                            <span class="badge badge-<?= $msg['type'] ?>">
                                <?= $msg['type'] === 'contact' ? ' Обычное' : ' По заказу' ?>
                            </span>
                            <span class="badge <?= $msg['is_read'] ? 'badge-read' : 'badge-unread' ?>">
                                <?= $msg['is_read'] ? ' Прочитано' : ' Новое' ?>
                            </span>
                            <span class="message-date">
                                 <?= date('d.m.Y H:i', strtotime($msg['created_at'])) ?>
                            </span>
                        </div>
                    </div>
                    <div class="message-body" id="message-<?= $msg['id'] ?>">
                        <div class="message-text">
                            <strong> Сообщение:</strong><br>
                            <?= nl2br(htmlspecialchars($msg['message'])) ?>
                        </div>
                        
                        <?php if (!empty($msg['replies'])): ?>
                            <div class="replies-section">
                                <strong> История ответов:</strong>
                                <?php foreach ($msg['replies'] as $reply): ?>
                                    <div class="reply-item">
                                        <div class="reply-text"> Администратор:<br><?= nl2br(htmlspecialchars($reply['reply_text'])) ?></div>
                                        <div class="reply-date"> <?= date('d.m.Y H:i', strtotime($reply['created_at'])) ?></div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                        
                        <div class="reply-form">
                            <h4>️ Ответить пользователю</h4>
                            <form method="POST" action="">
                                <input type="hidden" name="action" value="reply">
                                <input type="hidden" name="message_id" value="<?= $msg['id'] ?>">
                                <input type="hidden" name="user_email" value="<?= htmlspecialchars($msg['email']) ?>">
                                <input type="hidden" name="user_name" value="<?= htmlspecialchars($msg['name']) ?>">
                                <textarea name="reply_text" rows="3" placeholder="Напишите ответ..." required></textarea>
                                <div style="margin-top: 10px;">
                                    <button type="submit" class="btn btn-primary">️ Отправить ответ</button>
                                </div>
                            </form>
                        </div>
                        
                        <div class="actions">
                            <?php if (!$msg['is_read']): ?>
                                <form method="POST" action="" style="display: inline;">
                                    <input type="hidden" name="action" value="mark_read">
                                    <input type="hidden" name="id" value="<?= $msg['id'] ?>">
                                    <button type="submit" class="btn btn-success btn-sm">✓ Отметить прочитанным</button>
                                </form>
                            <?php endif; ?>
                            <form method="POST" action="" style="display: inline;" onsubmit="return confirm('Удалить это сообщение?');">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $msg['id'] ?>">
                                <button type="submit" class="btn btn-danger btn-sm">️ Удалить</button>
                            </form>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
    
    <script>
        function toggleMessage(id) {
            const el = document.getElementById('message-' + id);
            if (el) {
                el.classList.toggle('show');
            }
        }
    </script>
</body>
</html>
