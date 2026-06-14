<?php

/**
 * Database connection wrapper.
 * Creates and provides the shared mysqli database connection.
 */
class DBaccess
{
    private mysqli $db;

    /**
     * Opens a database connection.
     *
     * @throws RuntimeException If the database connection cannot be established
     */
    public function __construct()
    {
        $host = "localhost";
        $user = "root";
        $password = "";
        $database = "webProjekt26";

        $this->db = new mysqli($host, $user, $password, $database);

        if ($this->db->connect_error) {
            throw new RuntimeException('Unable to establish a database connection');
        }

        $this->db->set_charset("utf8mb4");
    }

    /**
     * Returns the active mysqli database connection.
     *
     * @return mysqli Active database connection
     */
    public function getConnection(): mysqli
    {
        return $this->db;
    }
}