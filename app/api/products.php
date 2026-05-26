<?php
// API для получения товаров из БД
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . '/config/database.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$category = isset($_GET['category']) ? $_GET['category'] : '';
$collection = isset($_GET['collection']) ? $_GET['collection'] : '';

try {
    if ($id > 0) {
        $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($product) {
            $product['images'] = json_decode($product['images'], true);
            echo json_encode($product);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
        }
    } else {
        $sql = "SELECT * FROM products WHERE 1=1";
        $params = [];
        if ($category) {
            $sql .= " AND category = ?";
            $params[] = $category;
        }
        if ($collection) {
            $sql .= " AND collection = ?";
            $params[] = $collection;
        }
        $sql .= " ORDER BY id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($products as &$p) {
            $p['images'] = json_decode($p['images'], true);
        }
        echo json_encode($products);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}