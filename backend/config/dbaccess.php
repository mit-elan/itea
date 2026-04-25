<?php
/**
 * DB-Verbindungskonfiguration
 * Werte an lokale XAMPP/MAMP-Einstellungen anpassen.
 */
// Datenbankverbindung – wird von DataHandler eingebunden
function getDatabaseConnection() {
    $host = "localhost";
    $user = "root";
    $password = "";
    $database = "webProjekt26";

    $db = new mysqli($host, $user, $password, $database);

    if ($db->connect_error) {
        echo "Connection Error: " . $db->connect_error;
        exit();
    }

    return $db;
}
?>