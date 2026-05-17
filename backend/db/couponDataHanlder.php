<?php

require_once __DIR__ . '/dbaccess.php';
require_once __DIR__ . '/../models/coupon.class.php';

class CouponDataHandler
{
    private mysqli $db;

    public function __construct(DBaccess $db)
    {
        $this->db = $db->getConnection();
    }
}