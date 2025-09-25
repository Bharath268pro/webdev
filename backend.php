<?php

header('Content-Type: application/json');

// Session must be started at the very beginning
session_start();

// Database credentials - REPLACE WITH YOUR OWN
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', 'Passaug2612a*');
define('DB_NAME', 'landen_shop');

// Connect to the database
function connect_db() {
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

    if ($conn->connect_error) {
        // Log the error internally, do not show to the user for security
        error_log("Connection failed: " . $conn->connect_error);
        return null;
    }
    return $conn;
}

// Function to generate a new CSRF token
function generate_csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// Check for POST request and action parameter
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];

    // Validate CSRF token for state-changing actions
    if ($action !== 'get_csrf_token' && (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token'])) {
        echo json_encode(['success' => false, 'message' => 'CSRF token validation failed.']);
        exit();
    }

    $conn = connect_db();
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
        exit();
    }

    switch ($action) {
        case 'register':
            handle_register($conn);
            break;
        case 'login':
            handle_login($conn);
            break;
        case 'get_products':
            handle_get_products($conn);
            break;
        case 'add_to_cart':
            handle_add_to_cart($conn);
            break;
        case 'get_cart_items':
            handle_get_cart_items($conn);
            break;
        case 'update_cart_quantity':
            handle_update_cart_quantity($conn);
            break;
        case 'remove_from_cart':
            handle_remove_from_cart($conn);
            break;
        case 'get_product_details':
            handle_get_product_details($conn);
            break;
        case 'get_csrf_token':
            // No CSRF token validation needed here as it's the token generator
            echo json_encode(['token' => generate_csrf_token()]);
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action.']);
            break;
    }

    $conn->close();
} else {
    // Return a message for invalid requests
    echo json_encode(['success' => false, 'message' => 'Invalid request method or missing action.']);
}

function handle_register($conn) {
    if (!isset($_POST['first_name'], $_POST['last_name'], $_POST['email'], $_POST['password'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
        return;
    }

    $first_name = $_POST['first_name'];
    $last_name = $_POST['last_name'];
    $email = $_POST['email'];
    $password = $_POST['password'];

    // Hash the password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Use prepared statement to prevent SQL injection
    $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $first_name, $last_name, $email, $password_hash);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Registration successful.', 'redirect' => 'login.html']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Email already exists.']);
    }
    $stmt->close();
}

function handle_login($conn) {
    if (!isset($_POST['email'], $_POST['password'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
        return;
    }

    $email = $_POST['email'];
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            echo json_encode(['success' => true, 'message' => 'Login successful.', 'redirect' => 'index.html']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Incorrect password.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found.']);
    }
    $stmt->close();
}

function handle_get_products($conn) {
    $sql = "SELECT * FROM products ORDER BY created_at DESC LIMIT 8";
    $result = $conn->query($sql);
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
    echo json_encode(['success' => true, 'products' => $products]);
}

function handle_get_product_details($conn) {
    if (!isset($_POST['product_id'])) {
        echo json_encode(['success' => false, 'message' => 'Product ID is required.']);
        return;
    }

    $product_id = $_POST['product_id'];
    $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->bind_param("i", $product_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $product = $result->fetch_assoc();

    if ($product) {
        echo json_encode(['success' => true, 'product' => $product]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Product not found.']);
    }
    $stmt->close();
}

function handle_add_to_cart($conn) {
    if (!isset($_SESSION['user_id'], $_POST['product_id'], $_POST['quantity'])) {
        echo json_encode(['success' => false, 'message' => 'User not logged in or missing data.']);
        return;
    }

    $user_id = $_SESSION['user_id'];
    $product_id = $_POST['product_id'];
    $quantity = (int)$_POST['quantity'];

    if ($quantity <= 0) {
        echo json_encode(['success' => false, 'message' => 'Quantity must be positive.']);
        return;
    }

    // Check if item is already in cart
    $stmt = $conn->prepare("SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?");
    $stmt->bind_param("ii", $user_id, $product_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Update quantity
        $cart_item = $result->fetch_assoc();
        $new_quantity = $cart_item['quantity'] + $quantity;
        $update_stmt = $conn->prepare("UPDATE cart_items SET quantity = ? WHERE id = ?");
        $update_stmt->bind_param("ii", $new_quantity, $cart_item['id']);
        $update_stmt->execute();
        $update_stmt->close();
    } else {
        // Add new item
        $insert_stmt = $conn->prepare("INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)");
        $insert_stmt->bind_param("iii", $user_id, $product_id, $quantity);
        $insert_stmt->execute();
        $insert_stmt->close();
    }

    echo json_encode(['success' => true, 'message' => 'Product added to cart.']);
    $stmt->close();
}

function handle_get_cart_items($conn) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'User not logged in.']);
        return;
    }

    $user_id = $_SESSION['user_id'];

    $stmt = $conn->prepare("SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $cart_items = [];
    while ($row = $result->fetch_assoc()) {
        $cart_items[] = $row;
    }

    echo json_encode(['success' => true, 'cart_items' => $cart_items]);
    $stmt->close();
}

function handle_update_cart_quantity($conn) {
    if (!isset($_SESSION['user_id'], $_POST['cart_item_id'], $_POST['quantity'])) {
        echo json_encode(['success' => false, 'message' => 'Missing data.']);
        return;
    }

    $user_id = $_SESSION['user_id'];
    $cart_item_id = $_POST['cart_item_id'];
    $quantity = (int)$_POST['quantity'];

    if ($quantity <= 0) {
        $stmt = $conn->prepare("DELETE FROM cart_items WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $cart_item_id, $user_id);
    } else {
        $stmt = $conn->prepare("UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?");
        $stmt->bind_param("iii", $quantity, $cart_item_id, $user_id);
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Cart updated.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update cart.']);
    }
    $stmt->close();
}

function handle_remove_from_cart($conn) {
    if (!isset($_SESSION['user_id'], $_POST['cart_item_id'])) {
        echo json_encode(['success' => false, 'message' => 'Missing data.']);
        return;
    }

    $user_id = $_SESSION['user_id'];
    $cart_item_id = $_POST['cart_item_id'];

    $stmt = $conn->prepare("DELETE FROM cart_items WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $cart_item_id, $user_id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Item removed from cart.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to remove item.']);
    }
    $stmt->close();
}
?>
