<?php
/**
 * Zentrale Session-Verwaltung.
 * Wird von serviceHandler.php als erstes eingebunden.
 */
session_start();

// Gibt den aktuell eingeloggten User zurück oder null.
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

//Prüft ob ein User eingeloggt ist.
function isLoggedIn(): bool
{
    return isset($_SESSION['user_id']);
}

// Prüft ob der eingeloggte User ein Admin ist.
function isAdmin(): bool
{
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}
