<?php
/**
 * Zentrale Session-Verwaltung.
 * Wird von serviceHandler.php als erstes eingebunden.
 */
session_start();

/**
 * Gibt den aktuell eingeloggten User zurück oder null.
 */
function getCurrentUser(): ?array {
    return $_SESSION['user'] ?? null;
}

/**
 * Prüft ob ein User eingeloggt ist.
 */
function isLoggedIn(): bool {
    return isset($_SESSION['user']);
}

/**
 * Prüft ob der eingeloggte User ein Admin ist.
 */
function isAdmin(): bool {
    return isset($_SESSION['user']) && $_SESSION['user']['role'] === 'admin';
}
