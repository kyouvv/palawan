<?php
// auth_status.php
require_once 'auth.php';

header('Content-Type: application/json');

$user = currentUser();

if ($user['id']) {
    echo json_encode([
        'authenticated' => true,
        'user' => [
            'id'       => $user['id'],
            'username' => $user['username'],
            'email'    => $user['role'] 
        ]
    ]);
} else {
    echo json_encode([
        'authenticated' => false
    ]);
}