<?php
// auth.php

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

function currentUser() {
    return [
        'id'       => $_SESSION['user_id']   ?? null,
        'username' => $_SESSION['user_name'] ?? null,
        'role'     => $_SESSION['user_email'] ?? null,
    ];
}