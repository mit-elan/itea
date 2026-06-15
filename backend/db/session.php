<?php

/**
 * Central session management.
 * This file is included by serviceHandler.php before request handling starts.
 * Handles session initialization and auto-login via remember-me cookies.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Restore user session from remember-me cookie if session is empty
if (!isset($_SESSION['user_id']) && isset($_COOKIE['remember_token'])) {
    require_once __DIR__ . '/userDataHandler.php';

    try {
        $db = new DBaccess();
        $userDataHandler = new UserDataHandler($db);
        $userData = $userDataHandler->getUserByRememberToken($_COOKIE['remember_token']);

        if ($userData) {
            // Re-establish session for remembered user
            session_regenerate_id(true);
            $_SESSION['user_id'] = $userData['id'];
            $_SESSION['username'] = $userData['username'];
            $_SESSION['role'] = $userData['role'];

            // Merge guest cart with persisted cart (same logic as login method)
            $cartDataHandler = new CartDataHandler($db);
            $guestCart = $_SESSION['cart'] ?? [];
            $dbCart = [];

            foreach ($cartDataHandler->loadCartFromDb($userData['id']) as $item) {
                $dbCart[$item->product_id] = $item->quantity;
            }

            foreach ($guestCart as $productId => $quantity) {
                $dbCart[$productId] = ($dbCart[$productId] ?? 0) + $quantity;
            }

            $_SESSION['cart'] = $dbCart;
        } else {
            // Token is invalid - clear the cookie
            setcookie('remember_token', '', time() - 3600, '/');
        }
    } catch (Exception $e) {
        // Silently fail - remember-me is a convenience feature, not critical
    }
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