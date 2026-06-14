<?php

/**
 * Central session management.
 * This file is included by serviceHandler.php before request handling starts.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Returns the currently logged-in user from the session.
 *
 * @return array|null Current user session data or null if no user is logged in
 */
function getCurrentUser(): ?array
{
    if (!isset($_SESSION['user_id'])) {
        return null;
    }

    return [
        'userId' => $_SESSION['user_id'],
        'username' => $_SESSION['username'] ?? '',
        'role' => $_SESSION['role'] ?? 'guest'
    ];
}

/**
 * Checks whether a user is currently logged in.
 *
 * @return bool True if a user session exists
 */
function isLoggedIn(): bool
{
    return isset($_SESSION['user_id']);
}

/**
 * Checks whether the currently logged-in user has the admin role.
 *
 * @return bool True if the current user is an admin
 */
function isAdmin(): bool
{
    return ($_SESSION['role'] ?? '') === 'admin';
}