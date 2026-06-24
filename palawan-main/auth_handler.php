<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}

$action = isset($_POST['action']) ? trim($_POST['action']) : '';

try {
    $dbPath = __DIR__ . '/data/newsletter.db';
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    exit;
}


if ($action === 'logout') {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    session_unset(); // Clears out the session variables
    session_destroy(); // Destroys the session completely
    
    echo json_encode(['status' => 'success']);
    exit;
}

if ($action === 'login') {
    $email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'Please fill in all fields.']);
        exit;
    }

    try {
        $stmt = $db->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Login successful! Welcome back, ' . htmlspecialchars($user['name']) . '.',
                'redirect' => 'index.html' 
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid email or password.']);
        }
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'An error occurred during authentication.']);
    }
    exit;
} 


if ($action === 'register') {
    $name = htmlspecialchars(trim($_POST['name'] ?? ''), ENT_QUOTES, 'UTF-8');
    $email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'] ?? '';

    if (empty($name) || empty($email) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'Please complete all details.']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'error', 'message' => 'Please provide a valid email address.']);
        exit;
    }

    if (strlen($password) < 8) {
        echo json_encode(['status' => 'error', 'message' => 'Password must be at least 8 characters long.']);
        exit;
    }

    try {
        // Securely hash the password string before storing
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $db->prepare("INSERT INTO users (name, email, password) VALUES (:name, :email, :password)");
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->execute();

        // Automatically log user into session post-registration
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['user_id'] = $db->lastInsertId();
        $_SESSION['user_name'] = $name;
        $_SESSION['user_email'] = $email;

        echo json_encode([
            'status' => 'success',
            'message' => 'Account created successfully! Logging you in...',
            'redirect' => 'index.html'
        ]);
    } catch (PDOException $e) {
        // Capture duplicate unique key constraints in SQLite
        if ($e->getCode() == '23000') {
            echo json_encode(['status' => 'error', 'message' => 'This email address is already registered.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Registration failed. Please try again later.']);
        }
    }
    exit;
}

// Fallback if action is unrecognized
echo json_encode(['status' => 'error', 'message' => 'Invalid operations sequence execution context.']);
exit;

