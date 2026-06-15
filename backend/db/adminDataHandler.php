<?php

require_once __DIR__ . '/dbaccess.php';
require_once __DIR__ . '/../models/user.class.php';
//Just a comment to see if all works well now

/**
 * Data access layer for admin operations.
 * Handles user administration, order overview data, order details, and order item removal.
 */
class AdminDataHandler
{
    private mysqli $db;

    /**
     * Initializes the admin data handler with a database connection.
     *
     * @param DBaccess $db Database connection handler
     */
    public function __construct(DBaccess $db)
    {
        $this->db = $db->getConnection();
    }

    /**
     * Retrieves all users for the admin user overview.
     *
     * @return array Array of User objects
     */
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

    /**
     * Activates or deactivates a user account.
     *
     * @param int $userId User identifier
     * @param bool $active New active status
     * @return bool True if the update query executed successfully
     */
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

        $stmt->bind_param(
            "ii",
            $activeValue,
            $userId
        );

        return $stmt->execute();
    }

    /**
     * Retrieves all orders placed by a specific user.
     *
     * @param int $userId User identifier
     * @return array Array of order summary data arrays
     */
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

    /**
     * Retrieves a single order with customer and voucher details for admin views.
     *
     * @param int $orderId Order identifier
     * @return array|null Order data if found, null otherwise
     */
    public function getOrderById(int $orderId): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT o.id,
                    o.user_id,
                    o.payment_method_id,
                    o.voucher_id,
                    o.initial_price,
                    o.voucher_discount,
                    o.date,
                    o.total_price,
                    o.invoice_number,
                    u.first_name,
                    u.last_name,
                    u.address,
                    u.zip,
                    u.city,
                    u.email,
                    u.username,
                    v.code AS voucher_code,
                    v.remaining_value AS voucher_remaining_value
             FROM `order` o
             JOIN user u
               ON o.user_id = u.id
             LEFT JOIN vouchers v
               ON o.voucher_id = v.id
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

    /**
     * Retrieves all visible order items for an order.
     * Removed items are excluded from the admin order detail view.
     *
     * @param int $orderId Order identifier
     * @return array Array of order item data arrays
     */
    public function getOrderItems(int $orderId): array
    {
        $stmt = $this->db->prepare(
            "SELECT oi.id,
                    oi.product_id,
                    p.name,
                    oi.unit_price AS price,
                    p.file_path,
                    oi.quantity,
                    oi.unit_price
             FROM order_item oi
             JOIN product p
               ON oi.product_id = p.id
             WHERE oi.order_id = ?
               AND (oi.removed = 0 OR oi.removed IS NULL)
             ORDER BY oi.id"
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

    /**
     * Marks an order item as removed.
     *
     * @param int $orderItemId Order item identifier
     * @return bool True if a matching order item was marked as removed
     */
    public function removeOrderItem(int $orderItemId): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE order_item
             SET removed = 1
             WHERE id = ?"
        );

        if (!$stmt) {
            return false;
        }

        $stmt->bind_param("i", $orderItemId);

        return $stmt->execute() && $stmt->affected_rows > 0;
    }

    /**
     * Recalculates the total price of an order based on all non-removed items.
     *
     * @param int $orderId Order identifier
     * @return bool True if the recalculation query executed successfully
     */
    public function recalculateOrderTotal(int $orderId): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE `order`
             SET total_price = (
                 SELECT COALESCE(SUM(quantity * unit_price), 0)
                 FROM order_item
                 WHERE order_id = ?
                   AND (removed = 0 OR removed IS NULL)
             )
             WHERE id = ?"
        );

        if (!$stmt) {
            return false;
        }

        $stmt->bind_param(
            "ii",
            $orderId,
            $orderId
        );

        return $stmt->execute();
    }

    /**
     * Retrieves all orders for the admin order overview.
     *
     * @return array Array of order overview data arrays
     */
    public function getAllOrders(): array
    {
        $stmt = $this->db->prepare(
            "SELECT o.id,
                    o.user_id,
                    o.date,
                    IF(o.initial_price = 0, o.total_price, o.initial_price) AS subtotal,
                    o.voucher_discount AS voucher,
                    o.total_price,
                    o.invoice_number,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.username
             FROM `order` o
             JOIN user u
               ON o.user_id = u.id
             ORDER BY o.date DESC"
        );

        if (!$stmt) {
            return [];
        }

        $stmt->execute();

        return $stmt
            ->get_result()
            ->fetch_all(MYSQLI_ASSOC);
    }
}