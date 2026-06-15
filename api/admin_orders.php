<?php
session_start();
$admin_password = 'admin'; // Смените пароль!
if (!isset($_SESSION['admin_logged']) && (!isset($_SERVER['PHP_AUTH_USER']) || $_SERVER['PHP_AUTH_PW'] !== $admin_password)) {
    header('WWW-Authenticate: Basic realm="Admin Panel"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'Access denied';
    exit;
}
$_SESSION['admin_logged'] = true;

require_once __DIR__ . '/api/config/database.php';

$message = '';
$error = '';

// Обработка AJAX-запроса на изменение статуса
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
    header('Content-Type: application/json');
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = (int)($input['user_id'] ?? 0);
    $orderId = $input['order_id'] ?? '';
    $newStatus = $input['status'] ?? '';

    if (!$userId || !$orderId || !$newStatus) {
        echo json_encode(['success' => false, 'error' => 'Недостаточно данных']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT orders FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $ordersJson = $stmt->fetchColumn();
        $orders = $ordersJson ? json_decode($ordersJson, true) : [];
        $updated = false;
        foreach ($orders as &$order) {
            if ((string)$order['id'] === (string)$orderId) {
                $order['status'] = $newStatus;
                $updated = true;
                break;
            }
        }
        if ($updated) {
            $stmt = $pdo->prepare("UPDATE users SET orders = ? WHERE id = ?");
            $stmt->execute([json_encode($orders, JSON_UNESCAPED_UNICODE), $userId]);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Заказ не найден']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Получаем всех пользователей и их заказы
$allOrders = [];
try {
    $stmt = $pdo->query("SELECT id, username, email, orders FROM users WHERE orders IS NOT NULL AND orders != '[]'");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($users as $user) {
        $orders = json_decode($user['orders'], true);
        if (is_array($orders)) {
            foreach ($orders as $order) {
                $order['user_id'] = $user['id'];
                $order['username'] = $user['username'];
                $order['user_email'] = $user['email'];
                $allOrders[] = $order;
            }
        }
    }
    // Сортируем по дате (новые сверху)
    usort($allOrders, function($a, $b) {
        return strtotime($b['date']) - strtotime($a['date']);
    });
} catch (PDOException $e) {
    $error = "Ошибка загрузки заказов: " . $e->getMessage();
}
?><!DOCTYPE html><html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Управление заказами</title>
    <style>
        * { box-sizing: border-box; font-family: system-ui, sans-serif; }
        body { background: #f3f4f6; margin: 0; padding: 20px; }
        .container { max-width: 1400px; margin: 0 auto; background: white; padding: 20px; border-radius: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { margin-top: 0; }
        .message { padding: 12px; margin-bottom: 20px; border-radius: 10px; }
        .success { background: #d1fae5; color: #065f46; border-left: 5px solid #10b981; }
        .error { background: #fee2e2; color: #991b1b; border-left: 5px solid #ef4444; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        th { background: #f9fafb; position: sticky; top: 0; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-processing { background: #fed7aa; color: #9a3412; }
        .status-shipped { background: #dbeafe; color: #1e40af; }
        .status-completed { background: #dcfce7; color: #166534; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
        select { padding: 6px 12px; border-radius: 8px; border: 1px solid #ccc; background: white; }
        button.save-status { background: #3b82f6; color: white; border: none; padding: 6px 16px; border-radius: 8px; cursor: pointer; margin-left: 8px; }
        button.save-status:hover { background: #2563eb; }
        .order-items { font-size: 0.85rem; color: #4b5563; max-width: 250px; }
        .order-items ul { margin: 0; padding-left: 18px; }
        .filter-bar { margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap; }
        .filter-bar select, .filter-bar input { padding: 8px 12px; border-radius: 8px; border: 1px solid #ccc; }
        .loading { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; justify-content: center; align-items: center; color: white; font-size: 1.2rem; }
        .loading.show { display: flex; }
        @media (max-width: 768px) { th, td { padding: 8px; } .order-items { max-width: 150px; } }
    </style>
</head>
<body>
<div class="loading" id="loading">⏳ Сохранение...</div>
<div class="container">
    <h1>📦 Управление заказами LUNA AUREA</h1>
    <div id="status-message"></div>    <div class="filter-bar">
        <label>Фильтр по статусу:</label>
        <select id="status-filter">
            <option value="all">Все</option>
            <option value="pending">В обработке (pending)</option>
            <option value="processing">В обработке (processing)</option>
            <option value="shipped">Отправлен (shipped)</option>
            <option value="completed">Завершён (completed)</option>
            <option value="cancelled">Отменён (cancelled)</option>
        </select>
        <input type="text" id="search-input" placeholder="Поиск по заказу или пользователю" style="flex:1; min-width:200px;">
    </div>    <div style="overflow-x: auto;">
        <table id="orders-table">
            <thead>
                <tr><th>ID заказа</th><th>Пользователь</th><th>Дата</th><th>Товары</th><th>Сумма</th><th>Статус</th><th>Действие</th></tr>
            </thead>
            <tbody id="orders-tbody">
                <?php foreach ($allOrders as $order): ?>
                <tr data-user-id="<?= $order['user_id'] ?>" data-order-id="<?= $order['id'] ?>" data-status="<?= $order['status'] ?>">
                    <td><strong>#<?= htmlspecialchars($order['id']) ?></strong></td>
                    <td><?= htmlspecialchars($order['username']) ?><br><small><?= htmlspecialchars($order['user_email']) ?></small></td>
                    <td><?= date('d.m.Y H:i', strtotime($order['date'])) ?></td>
                    <td class="order-items">
                        <ul>
                        <?php 
                        $items = is_array($order['items']) ? $order['items'] : [];
                        foreach ($items as $item): ?>
                            <li><?= htmlspecialchars($item['name']) ?> (x<?= $item['quantity'] ?? 1 ?>) – <?= number_format($item['price'], 0, ',', ' ') ?> ₽</li>
                        <?php endforeach; ?>
                        </ul>
                    </td>
                    <td><strong><?= number_format($order['total'], 0, ',', ' ') ?> ₽</strong></td>
                    <td class="status-cell">
                        <span class="status-badge status-<?= $order['status'] ?>"><?= $order['status'] ?></span>
                    </td>
                    <td>
                        <select class="new-status">
                            <option value="pending" <?= $order['status'] === 'pending' ? 'selected' : '' ?>>В обработке (pending)</option>
                            <option value="processing" <?= $order['status'] === 'processing' ? 'selected' : '' ?>>В обработке (processing)</option>
                            <option value="shipped" <?= $order['status'] === 'shipped' ? 'selected' : '' ?>>Отправлен (shipped)</option>
                            <option value="completed" <?= $order['status'] === 'completed' ? 'selected' : '' ?>>Завершён (completed)</option>
                            <option value="cancelled" <?= $order['status'] === 'cancelled' ? 'selected' : '' ?>>Отменён (cancelled)</option>
                        </select>
                        <button class="save-status">Сохранить</button>
                    </td>
                </tr>
                <?php endforeach; ?>
                <?php if (empty($allOrders)): ?>
                <tr><td colspan="7" style="text-align:center;">Заказов пока нет</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div><script>
    const loading = document.getElementById('loading');
    const tbody = document.getElementById('orders-tbody');
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('search-input');

    function showMessage(text, isError = false) {
        const msgDiv = document.getElementById('status-message');
        msgDiv.innerHTML = `<div class="message ${isError ? 'error' : 'success'}">${isError ? '❌ ' : '✅ '}${text}</div>`;
        setTimeout(() => { msgDiv.innerHTML = ''; }, 3000);
    }

    async function updateStatus(userId, orderId, newStatus, row) {
        loading.classList.add('show');
        try {
            const response = await fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ user_id: userId, order_id: orderId, status: newStatus })
            });
            const data = await response.json();
            if (data.success) {
                // Обновляем отображение статуса в строке
                const statusSpan = row.querySelector('.status-badge');
                statusSpan.className = `status-badge status-${newStatus}`;
                statusSpan.textContent = newStatus;
                const select = row.querySelector('.new-status');
                select.value = newStatus;
                row.setAttribute('data-status', newStatus);
                showMessage(`Статус заказа #${orderId} изменён на "${newStatus}"`);
                // Если фильтр активен, возможно, строка должна скрыться
                applyFilters();
            } else {
                showMessage(data.error || 'Ошибка при обновлении', true);
            }
        } catch (err) {
            showMessage('Ошибка сети: ' + err.message, true);
        } finally {
            loading.classList.remove('show');
        }
    }

    // Обработчики кнопок Сохранить
    document.querySelectorAll('.save-status').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const row = this.closest('tr');
            const userId = row.getAttribute('data-user-id');
            const orderId = row.getAttribute('data-order-id');
            const newStatus = row.querySelector('.new-status').value;
            updateStatus(userId, orderId, newStatus, row);
        });
    });

    // Фильтрация строк по статусу и поиску
    function applyFilters() {
        const filterValue = statusFilter.value;
        const searchTerm = searchInput.value.toLowerCase();
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            if (row.cells.length === 1) return; // строка "нет заказов"
            const status = row.getAttribute('data-status');
            const text = row.innerText.toLowerCase();
            let matches = true;
            if (filterValue !== 'all' && status !== filterValue) matches = false;
            if (searchTerm && !text.includes(searchTerm)) matches = false;
            row.style.display = matches ? '' : 'none';
        });
    }

    statusFilter.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
</script></body>
</html>