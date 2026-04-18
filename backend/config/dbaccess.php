<?php
/**
 * DB-Verbindungskonfiguration
 * Werte an lokale XAMPP/MAMP-Einstellungen anpassen.
 */
// Datenbankverbindung – wird von DataHandler eingebunden
function getDatabaseConnection() {
    $host = "localhost";
    $user = "webProjektUser";
    $password = "webProjekt";
    $database = "webProjekt";

    $db = new mysqli($host, $user, $password, $database);

    if ($db->connect_error) {
        echo "Connection Error: " . $db->connect_error;
        exit();
    }

    return $db;
}
?>