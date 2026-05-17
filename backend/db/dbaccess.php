<?php
/**
 * DB-Verbindungsklasse
 * Verwaltet die Datenbankverbindung
 */
class DBaccess {
    private mysqli $db;

    public function __construct() {
        $host = "localhost";
        $user = "root";
        $password = "";
        $database = "webProjekt26";

        $this->db = new mysqli($host, $user, $password, $database);

        if ($this->db->connect_error) {
            throw new RuntimeException('Unable to establish a database connection');
        }
    }

    /**
     * Gibt die mysqli-Verbindung zurück
     */
    public function getConnection(): mysqli {
        return $this->db;
    }
}
?>