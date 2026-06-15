<?php
function getAuthUser() {
    global $pdo;
    $headers = getallheaders();
    if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'] ?? '', $matches)) {
        $payload = verifyJWT($matches[1]);
        if ($payload && isset($payload['userId'])) {
            $stmt = $pdo->prepare("SELECT id, username, email FROM users WHERE id = ?");
            $stmt->execute([$payload['userId']]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
    }
    return null;
}
?>