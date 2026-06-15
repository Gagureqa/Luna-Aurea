<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: index.php');
    exit;
}

require_once __DIR__ . '/../api/config/database.php';

$message = '';
$error = '';

if (!$pdo) {
    $error = 'Нет подключения к базе данных.';
} else {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $action = $_POST['action'] ?? '';
        if ($action === 'add') {
            $name = trim($_POST['name']);
            $price = (float)$_POST['price'];
            $description = trim($_POST['description']);
            $material = trim($_POST['material']);
            $length = trim($_POST['length']);
            $weight = trim($_POST['weight']);
            $size = trim($_POST['size']);
            $category = trim($_POST['category']);
            $collection = trim($_POST['collection']);
            $in_stock = isset($_POST['in_stock']) ? 1 : 0;
            $images = json_encode(array_filter(array_map('trim', explode("\n", $_POST['images']))));
            try {
                $stmt = $pdo->prepare("INSERT INTO products (name, price, description, material, length, weight, size, category, collection, in_stock, images) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
                $stmt->execute([$name, $price, $description, $material, $length, $weight, $size, $category, $collection, $in_stock, $images]);
                $message = " Товар добавлен";
            } catch (PDOException $e) { $error = "Ошибка: " . $e->getMessage(); }
        } elseif ($action === 'edit') {
            $id = (int)$_POST['id'];
            $name = trim($_POST['name']);
            $price = (float)$_POST['price'];
            $description = trim($_POST['description']);
            $material = trim($_POST['material']);
            $length = trim($_POST['length']);
            $weight = trim($_POST['weight']);
            $size = trim($_POST['size']);
            $category = trim($_POST['category']);
            $collection = trim($_POST['collection']);
            $in_stock = isset($_POST['in_stock']) ? 1 : 0;
            $images = json_encode(array_filter(array_map('trim', explode("\n", $_POST['images']))));
            try {
                $stmt = $pdo->prepare("UPDATE products SET name=?, price=?, description=?, material=?, length=?, weight=?, size=?, category=?, collection=?, in_stock=?, images=? WHERE id=?");
                $stmt->execute([$name, $price, $description, $material, $length, $weight, $size, $category, $collection, $in_stock, $images, $id]);
                $message = " Товар обновлён";
            } catch (PDOException $e) { $error = "Ошибка: " . $e->getMessage(); }
        } elseif ($action === 'delete') {
            $id = (int)$_POST['id'];
            try {
                $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
                $stmt->execute([$id]);
                $message = " Товар удалён";
            } catch (PDOException $e) { $error = "Ошибка удаления: " . $e->getMessage(); }
        }
    }

    $products = [];
    try {
        $stmt = $pdo->query("SELECT * FROM products ORDER BY id DESC");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) { $error = "Ошибка загрузки: " . $e->getMessage(); }
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Управление товарами | Luna Aurea Admin</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; background: #f3f4f6; margin: 0; padding: 0; }
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
        h2 { margin-top: 0; }
        .form-group { margin-bottom: 12px; display: flex; flex-wrap: wrap; align-items: center; }
        label { width: 120px; font-weight: 600; }
        input, textarea, select { flex: 1; min-width: 200px; padding: 8px 12px; border: 1px solid #ccc; border-radius: 8px; }
        textarea { font-family: monospace; }
        button { background: #3b82f6; color: white; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; margin-right: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { text-align: left; padding: 10px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
        th { background: #f9fafb; }
        .actions { white-space: nowrap; }
        .edit-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; margin-right: 8px; color: #3b82f6; }
        .message { padding: 12px; margin-bottom: 20px; border-radius: 10px; }
        .success { background: #d1fae5; color: #065f46; border-left: 5px solid #10b981; }
        .error { background: #fee2e2; color: #991b1b; border-left: 5px solid #ef4444; }
        .form-section { background: #f9fafb; padding: 20px; border-radius: 16px; margin-bottom: 30px; }
        .back-link { display: inline-block; margin-bottom: 20px; color: #3b82f6; text-decoration: none; }
        @media (max-width: 768px) { .form-group { flex-direction: column; align-items: flex-start; } label { width: 100%; margin-bottom: 5px; } input, textarea, select { width: 100%; } }
    </style>
</head>
<body>
    <div class="admin-header">
        <h1> Luna Aurea — Управление товарами</h1>
        <div class="nav-links">
            <a href="dashboard.php"> Главная</a>
            <a href="products.php" class="active"> Товары</a>
            <a href="orders.php"> Заказы</a>
            <a href="messages.php"> Сообщения</a>
            <a href="?logout=1" class="logout" onclick="return confirm('Выйти?')"> Выход</a>
        </div>
    </div>
    <div class="container">
        <a href="dashboard.php" class="back-link">← На главную</a>
        <?php if ($message): ?><div class="message success"><?= htmlspecialchars($message) ?></div><?php endif; ?>
        <?php if ($error): ?><div class="message error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
        <div class="form-section">
            <h2 id="form-title"> Добавить товар</h2>
            <form method="POST" id="product-form">
                <input type="hidden" name="action" id="form-action" value="add">
                <input type="hidden" name="id" id="product-id" value="0">
                <div class="form-group"><label>Название *</label> <input type="text" name="name" id="product-name" required></div>
                <div class="form-group"><label>Цена (₽) *</label> <input type="number" step="0.01" name="price" id="product-price" required></div>
                <div class="form-group"><label>Описание</label> <textarea name="description" id="product-description" rows="3"></textarea></div>
                <div class="form-group"><label>Материал</label> <input type="text" name="material" id="product-material"></div>
                <div class="form-group"><label>Длина</label> <input type="text" name="length" id="product-length"></div>
                <div class="form-group"><label>Вес</label> <input type="text" name="weight" id="product-weight"></div>
                <div class="form-group"><label>Размер</label> <input type="text" name="size" id="product-size"></div>
                <div class="form-group"><label>Категория</label>
                    <select name="category" id="product-category">
                        <option value="rings">Кольца</option><option value="earrings">Серьги</option>
                        <option value="necklaces">Колье</option><option value="bracelets">Браслеты</option>
                        <option value="sets">Комплекты</option>
                    </select>
                </div>
                <div class="form-group"><label>Коллекция</label>
                    <select name="collection" id="product-collection">
                        <option value="luna">LUNA</option><option value="solaris">SOLARIS</option>
                        <option value="planet">PLANET</option><option value="polarlights">POLAR LIGHTS</option>
                    </select>
                </div>
                <div class="form-group"><label><input type="checkbox" name="in_stock" id="product-in_stock" checked> В наличии</label></div>
                <div class="form-group"><label>Изображения (URL, по одному на строку)</label> <textarea name="images" id="product-images" rows="3" placeholder="/images/example1.jpg\n/images/example2.jpg"></textarea></div>
                <div class="form-group">
                    <button type="submit"> Сохранить</button>
                    <button type="button" id="cancel-edit" style="background:#6b7280;">Отмена</button>
                </div>
            </form>
        </div>
        <h2> Список товаров</h2>
        <?php if (empty($products)): ?>
            <p>Нет товаров. Добавьте первый.</p>
        <?php else: ?>
            <div style="overflow-x: auto;">
                <table>
                    <thead><tr><th>ID</th><th>Изобр.</th><th>Название</th><th>Цена</th><th>Категория</th><th>Коллекция</th><th>В наличии</th><th>Действия</th></tr></thead>
                    <tbody>
                    <?php foreach ($products as $p): 
                        $images = json_decode($p['images'], true);
                        $firstImage = !empty($images) ? htmlspecialchars($images[0]) : '';
                    ?>
                    <tr data-id="<?= $p['id'] ?>" data-name="<?= htmlspecialchars($p['name']) ?>" data-price="<?= $p['price'] ?>" data-description="<?= htmlspecialchars($p['description']) ?>" data-material="<?= htmlspecialchars($p['material']) ?>" data-length="<?= htmlspecialchars($p['length']) ?>" data-weight="<?= htmlspecialchars($p['weight']) ?>" data-size="<?= htmlspecialchars($p['size']) ?>" data-category="<?= $p['category'] ?>" data-collection="<?= $p['collection'] ?>" data-in_stock="<?= $p['in_stock'] ?>" data-images="<?= htmlspecialchars(implode("\n", $images ?: [])) ?>">
                        <td><?= $p['id'] ?></td>
                        <td><?php if ($firstImage): ?><img src="<?= $firstImage ?>" style="width:40px;height:40px;object-fit:cover;border-radius:6px;"><?php else: ?>—<?php endif; ?></td>
                        <td><?= htmlspecialchars($p['name']) ?></td>
                        <td><?= number_format($p['price'], 0, ',', ' ') ?> ₽</td>
                        <td><?= $p['category'] ?></td>
                        <td><?= $p['collection'] ?></td>
                        <td><?= $p['in_stock'] ? 'Да' : 'Нет' ?></td>
                        <td class="actions">
                            <button class="edit-btn" title="Редактировать">Редактировать</button>
                            <form method="POST" style="display:inline;" onsubmit="return confirm('Удалить товар?');">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $p['id'] ?>">
                                <button type="submit" style="background:none; border:none; font-size:1.2rem; color:#ef4444; cursor:pointer;">️удалить</button>
                            </form>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
    <script>
        const form = document.getElementById('product-form');
        const formTitle = document.getElementById('form-title');
        const cancelBtn = document.getElementById('cancel-edit');
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                document.getElementById('form-action').value = 'edit';
                document.getElementById('product-id').value = row.dataset.id;
                document.getElementById('product-name').value = row.dataset.name;
                document.getElementById('product-price').value = row.dataset.price;
                document.getElementById('product-description').value = row.dataset.description || '';
                document.getElementById('product-material').value = row.dataset.material || '';
                document.getElementById('product-length').value = row.dataset.length || '';
                document.getElementById('product-weight').value = row.dataset.weight || '';
                document.getElementById('product-size').value = row.dataset.size || '';
                document.getElementById('product-category').value = row.dataset.category;
                document.getElementById('product-collection').value = row.dataset.collection;
                document.getElementById('product-in_stock').checked = row.dataset.in_stock == '1';
                document.getElementById('product-images').value = row.dataset.images || '';
                formTitle.innerText = '️ Редактировать товар';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
        
        cancelBtn.addEventListener('click', function() {
            form.reset();
            document.getElementById('form-action').value = 'add';
            document.getElementById('product-id').value = '0';
            formTitle.innerText = ' Добавить товар';
            document.getElementById('product-in_stock').checked = true;
        });
    </script>
</body>
</html>
