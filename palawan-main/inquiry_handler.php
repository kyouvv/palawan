<?php
header('Content-Type: application/json');

require_once 'auth.php';
$user = currentUser();

// ── Auth guard ───────────────────────────────────────────────────────────────
if (!$user['id']) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'You must be logged in to perform this action.']);
    exit;
}

// ── DB connection ────────────────────────────────────────────────────────────
try {
    $db = new PDO('sqlite:' . __DIR__ . '/data/newsletter.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    exit;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET  — fetch inquiry history for the logged-in user
// ─────────────────────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($_GET['action'] ?? '') === 'history') {
    try {
        $stmt = $db->prepare(
            "SELECT destination, subject, message, status, submitted_at
             FROM inquiries
             WHERE user_id = :uid
             ORDER BY submitted_at DESC
             LIMIT 20"
        );
        $stmt->bindParam(':uid', $user['id'], PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format dates for readability
        foreach ($rows as &$row) {
            $row['submitted_at'] = date('M j, Y · g:i A', strtotime($row['submitted_at']));
        }
        unset($row);

        echo json_encode(['status' => 'success', 'inquiries' => $rows]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Could not retrieve inquiries.']);
    }
    exit;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST  — submit a new inquiry
// ─────────────────────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $destination = htmlspecialchars(trim($_POST['destination'] ?? ''), ENT_QUOTES, 'UTF-8');
    $subject     = htmlspecialchars(trim($_POST['subject']     ?? ''), ENT_QUOTES, 'UTF-8');
    $message     = htmlspecialchars(trim($_POST['message']     ?? ''), ENT_QUOTES, 'UTF-8');

    // Server-side validation
    if (empty($destination)) {
        echo json_encode(['status' => 'error', 'message' => 'Please select a destination.']);
        exit;
    }
    if (empty($subject) || strlen($subject) > 150) {
        echo json_encode(['status' => 'error', 'message' => 'Subject must be between 1 and 150 characters.']);
        exit;
    }
    if (empty($message) || strlen($message) > 1000) {
        echo json_encode(['status' => 'error', 'message' => 'Message must be between 1 and 1000 characters.']);
        exit;
    }

    try {
        $stmt = $db->prepare(
            "INSERT INTO inquiries (user_id, destination, subject, message)
             VALUES (:uid, :destination, :subject, :message)"
        );
        $stmt->bindParam(':uid',         $user['id'],     PDO::PARAM_INT);
        $stmt->bindParam(':destination', $destination);
        $stmt->bindParam(':subject',     $subject);
        $stmt->bindParam(':message',     $message);
        $stmt->execute();

        echo json_encode([
            'status'  => 'success',
            'message' => '✅ Your inquiry has been sent! We\'ll get back to you shortly.'
        ]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to submit inquiry. Please try again.']);
    }
    exit;
}

// Fallback
echo json_encode(['status' => 'error', 'message' => 'Invalid request.']);
exit;