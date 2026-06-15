<?php
header("Content-Type: application/json");

echo json_encode([
    'getallheaders' => function_exists('getallheaders') ? getallheaders() : 'not available',
    'HTTP_AUTHORIZATION' => $_SERVER['HTTP_AUTHORIZATION'] ?? 'NOT SET',
    'REDIRECT_HTTP_AUTHORIZATION' => $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 'NOT SET',
    'apache_request_headers' => function_exists('apache_request_headers') ? apache_request_headers() : 'not available',
    'SERVER_SOFTWARE' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown'
]);