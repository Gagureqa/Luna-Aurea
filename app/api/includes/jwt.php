<?php
function generateJWT($userId, $email) {
    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64_encode(json_encode(['userId' => $userId, 'email' => $email, 'iat' => time(), 'exp' => time() + 604800]));
    $signature = hash_hmac('sha256', "$header.$payload", 'luna-aurea-secret-key-2024', true);
    return "$header.$payload." . str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[2]));
    if (!hash_equals($signature, hash_hmac('sha256', "$parts[0].$parts[1]", 'luna-aurea-secret-key-2024', true))) return null;
    $payload = json_decode(base64_decode($parts[1]), true);
    return ($payload['exp'] > time()) ? $payload : null;
}
?>