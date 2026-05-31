<?php

require_once __DIR__ . '/dbaccess.php';
require_once __DIR__ . '/../models/user.class.php';

class AdminDataHandler
{
    private mysqli $db;

    public function __construct(DBaccess $db)
    {
        $this->db = $db->getConnection();
    }

    public function getUsers(): array
    {
        $stmt = $this->db->prepare(
            "SELECT id,
                    salutation,
                    first_name,
                    last_name,
                    address,
                    zip,
                    city,
                    email,
                    username,
                    role,
                    active
             FROM user
             ORDER BY id ASC"
        );

        if (!$stmt) {
            return [];
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $users = [];

        while ($row = $result->fetch_assoc()) {
            $users[] = new User($row);
        }

        return $users;
    }

    public function setUserActive(int $userId, bool $active): bool
    {
        $activeValue = $active ? 1 : 0;

        $stmt = $this->db->prepare(
            "UPDATE user
             SET active = ?
             WHERE id = ?"
        );

        if (!$stmt) {
            return false;
        }

        $stmt->bind_param("ii", $activeValue, $userId);

        return $stmt->execute();
    }

    public function getOrdersByUserId(int $userId): array
{
    $stmt = $this->db->prepare(
        "SELECT id,
                date,
                total_price,
                invoice_number
         FROM `order`
         WHERE user_id = ?
         ORDER BY date DESC"
    );

    if (!$stmt) {
        return [];
    }

    $stmt->bind_param("i", $userId);
    $stmt->execute();

    return $stmt
        ->get_result()
        ->fetch_all(MYSQLI_ASSOC);
}

public function getOrderById(int $orderId): ?array
{
    $stmt = $this->db->prepare(
        "SELECT
            o.id,
            o.user_id,
            o.payment_method_id,
            o.voucher_id,
            o.date,
            o.total_price,
            o.invoice_number,

            u.first_name,
            u.last_name,
            u.address,
            u.zip,
            u.city,
            u.email,
            u.username

         FROM `order` o

         JOIN user u
            ON o.user_id = u.id

         WHERE o.id = ?

         LIMIT 1"
    );

    if (!$stmt) {
        return null;
    }

    $stmt->bind_param("i", $orderId);
    $stmt->execute();

    $order = $stmt
        ->get_result()
        ->fetch_assoc();

    return $order ?: null;
}

public function getOrderItems(int $orderId): array
{
    $stmt = $this->db->prepare(
        "SELECT p.name,
                p.price,
                p.file_path,
                oi.quantity,
                oi.unit_price
         FROM order_item oi
         JOIN product p
           ON oi.product_id = p.id
         WHERE oi.order_id = ?"
    );

    if (!$stmt) {
        return [];
    }

    $stmt->bind_param("i", $orderId);
    $stmt->execute();

    return $stmt
        ->get_result()
        ->fetch_all(MYSQLI_ASSOC);
}
}