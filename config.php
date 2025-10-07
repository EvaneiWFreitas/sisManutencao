<?php
// Database configuration
$host = 'localhost';
//$host = 'sql207.infinityfree.com';
$dbname = 'techservice';
//$dbname = 'if0_40114025_techservice';
$username = 'root';
$password = '';

// Create connection
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// Start session
session_start();

// CORS headers for API
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Response helper function
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

// Error handler function
function handleError($message, $statusCode = 400) {
    jsonResponse(['error' => $message], $statusCode);
}

// Success handler function
function handleSuccess($data, $message = 'Success') {
    jsonResponse(['success' => true, 'message' => $message, 'data' => $data]);
}
?>