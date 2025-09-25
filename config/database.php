<?php
// Database configuration
$db_host = 'localhost';
$db_name = 'landen_fashion';
$db_user = 'root';
$db_pass = ''; // Default password is empty for XAMPP

// PDO connection options
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    // Create PDO instance
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, $options);
    
    // Create database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS $db_name");
    $pdo->exec("USE $db_name");
    
} catch (PDOException $e) {
    // Log error and display user-friendly message
    error_log("Database Connection Error: " . $e->getMessage());
    die("Sorry, there was a problem connecting to the database. Please try again later.");
}
?>