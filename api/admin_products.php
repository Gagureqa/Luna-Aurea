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

if (!$pdo) {
    $error = 'Нет подключения к базе данных.';
} else {
    // Обработка POST (добавление, редактирование, удаление)
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
                $message = "✅ Товар добавлен";
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
                $message = "✅ Товар обновлён";
            } catch (PDOException $e) { $error = "Ошибка: " . $e->getMessage(); }
        } elseif ($action === 'delete') {
            $id = (int)$_POST['id'];
            try {
                $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
                $stmt->execute([$id]);
                $message = "✅ Товар удалён";
            } catch (PDOException $e) { $error = "Ошибка удаления: " . $e->getMessage(); }
        }
    }

    // Загрузка товаров
    $products = [];
    try {
        $stmt = $pdo->query("SELECT * FROM products ORDER BY id DESC");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) { $error = "Ошибка загрузки: " . $e->getMessage(); }
}
?><!DOCTYPE html><html>
<head>
    <meta charset="UTF-8">
    <title>Управление товарами</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }
        .container { max-width: 1300px; margin: 0 auto; background: white; padding: 20px; border-radius: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1, h2 { margin-top: 0; }
        .form-group { margin-bottom: 12px; display: flex; flex-wrap: wrap; align-items: center; }
        label { width: 120px; font-weight: 600; }
        input, textarea, select { flex: 1; min-width: 200px; padding: 8px 12px; border: 1px solid #ccc; border-radius: 8px; }
        textarea { font-family: monospace; }
        button { background: #3b82f6; color: white; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; margin-right: 10px; }
        button.delete-btn { background: #ef4444; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { text-align: left; padding: 10px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
        th { background: #f9fafb; }
        .actions { white-space: nowrap; }
        .edit-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; margin-right: 8px; color: #3b82f6; }
        .message { padding: 12px; margin-bottom: 20px; border-radius: 10px; }
        .success { background: #d1fae5; color: #065f46; border-left: 5px solid #10b981; }
        .error { background: #fee2e2; color: #991b1b; border-left: 5px solid #ef4444; }
        .form-section { background: #f9fafb; padding: 20px; border-radius: 16px; margin-bottom: 30px; }
        hr { margin: 20px 0; }
    </style>
</head>
<body>
<div class="container">
    <h1>🛒 Управление товарами LUNA AUREA</h1>
    <?php if ($message): ?><div class="message success"><?= htmlspecialchars($message) ?></div><?php endif; ?>
    <?php if ($error): ?><div class="message error"><?= htmlspecialchars($error) ?></div><?php endif; ?>    <div class="form-section">
        <h2 id="form-title">➕ Добавить товар</h2>
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
                <button type="submit">💾 Сохранить</button>
                <button type="button" id="cancel-edit" style="background:#6b7280;">Отмена</button>
            </div>
        </form>
    </div>    <h2>📋 Список товаров</h2>
    <?php if (empty($products)): ?>
        <p>Нет товаров. Добавьте первый.</p>
    <?php else: ?>
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
                <td><?= $p['in_stock'] ? '✅' : '❌' ?></td>
                <td class="actions">
                    <button class="edit-btn" title="Редактировать">✏️</button>
                    <form method="POST" style="display:inline;" onsubmit="return confirm('Удалить товар?');">
                        <input type="hidden" name="action" value="delete">
                        <input type="hidden" name="id" value="<?= $p['id'] ?>">
                        <button type="submit" class="delete-btn" style="background:none; border:none; font-size:1.2rem; color:#ef4444; cursor:pointer;">🗑️</button>
                    </form>
                </td>
            </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    <?php endif; ?>
</div><script>
    const form = document.getElementById('product-form');
    const formTitle = document.getElementById('form-title');
    const cancelBtn = document.getElementById('cancel-edit');
    
    // Вешаем обработчик на все кнопки редактирования
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            // Получаем данные из data-атрибутов строки
            const id = row.dataset.id;
            const name = row.dataset.name;
            const price = row.dataset.price;
            const description = row.dataset.description || '';
            const material = row.dataset.material || '';
            const length = row.dataset.length || '';
            const weight = row.dataset.weight || '';
            const size = row.dataset.size || '';
            const category = row.dataset.category;
            const collection = row.dataset.collection;
            const inStock = row.dataset.in_stock == '1';
            const images = row.dataset.images || '';
            
            // Заполняем форму
            document.getElementById('form-action').value = 'edit';
            document.getElementById('product-id').value = id;
            document.getElementById('product-name').value = name;
            document.getElementById('product-price').value = price;
            document.getElementById('product-description').value = description;
            document.getElementById('product-material').value = material;
            document.getElementById('product-length').value = length;
            document.getElementById('product-weight').value = weight;
            document.getElementById('product-size').value = size;
            document.getElementById('product-category').value = category;
            document.getElementById('product-collection').value = collection;
            document.getElementById('product-in_stock').checked = inStock;
            document.getElementById('product-images').value = images;
            formTitle.innerText = '✏️ Редактировать товар';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    cancelBtn.addEventListener('click', function() {
        form.reset();
        document.getElementById('form-action').value = 'add';
        document.getElementById('product-id').value = '0';
        formTitle.innerText = '➕ Добавить товар';
        document.getElementById('product-in_stock').checked = true;
    });
</script></body>
</html>