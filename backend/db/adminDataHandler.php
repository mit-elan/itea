<?php

require_once __DIR__ . '/dbaccess.php';

class AdminDataHandler
{
    private mysqli $db;

    public function __construct(DBaccess $db)
    {
        $this->db = $db->getConnection();
    }
}