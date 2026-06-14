<?php

require_once __DIR__ . '/dbaccess.php';
require_once __DIR__ . '/../models/order.class.php';

/**
 * Data access layer for order persistence.
 * Handles creating orders, loading customer orders, and retrieving order details.
 */
class OrderDataHandler
{
    private mysqli $db;

    /**
     * Initializes the order data handler with a database connection.
     *
     * @param DBaccess $db Database connection handler
     */
    public function __construct(DBaccess $db)
    {
        $this->db = $db->getConnection();
    }

    /**
     * Creates a new order with invoice number and order items.
     * The complete order creation is executed as a transaction.
     *
     * @param Order $order Order object with user, payment, voucher, price, and item data
     * @return array Order ID and invoice number on success, empty array on failure
     */
    public function createOrder(Order $order): array
    {
        $this->db->begin_transaction();

        try {
            $stmt = $this->db->prepare(
                "INSERT INTO `order` (
                    user_id,
                    initial_price,
                    total_price,
                    voucher_id,
                    voucher_discount,
                    payment_method_id
                ) VALUES (?, ?, ?, ?, ?, ?)"
            );

            $stmt->bind_param(
                "iddidi",
                $order->userId,
                $order->initialPrice,
                $order->totalPrice,
                $order->voucherId,
                $order->voucherDiscount,
                $order->paymentMethodId
            );

            $stmt->execute();

            $orderId = $stmt->insert_id;

            $invoiceNumber = 'INV-' .
                date('Ymd') .
                '-' .
                str_pad(
                    (string)$orderId,
                    4,
                    '0',
                    STR_PAD_LEFT
                );

            $stmt = $this->db->prepare(
                "UPDATE `order`
                 SET invoice_number = ?
                 WHERE id = ?"
            );

            $stmt->bind_param(
                "si",
                $invoiceNumber,
                $orderId
            );

            $stmt->execute();

            $stmt = $this->db->prepare(
                "INSERT INTO order_item (
                    order_id,
                    product_id,
                    quantity,
                    unit_price
                ) VALUES (?, ?, ?, ?)"
            );

            foreach ($order->items as $item) {
                $productId = (int)$item['product_id'];
                $quantity = (int)$item['quantity'];
                $unitPrice = (float)$item['unit_price'];

                $stmt->bind_param(
                    "iiid",
                    $orderId,
                    $productId,
                    $quantity,
                    $unitPrice
                );

                $stmt->execute();
            }

            $this->db->commit();

            return [
                'orderId' => $orderId,
                'invoiceNumber' => $invoiceNumber
            ];
        } catch (mysqli_sql_exception $e) {
            $this->db->rollback();

            return [];
        }
    }

    /**
     * Retrieves all orders for a specific user.
     *
     * @param int $userId User identifier
     * @return array Array of order summary data arrays
     */
    public function getOrdersByUser(int $userId): array
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

        $stmt->bind_param("i", $userId);
        $stmt->execute();

        return $stmt
            ->get_result()
            ->fetch_all(MYSQLI_ASSOC);
    }

    /**
     * Retrieves a single order with customer and voucher details.
     *
     * @param int $orderId Order identifier
     * @param int $userId User identifier
     * @return Order|null Order object if found, null otherwise
     */
    public function getOrderById(int $orderId, int $userId): ?Order
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
                    v.code AS voucher_code,
                    v.remaining_value AS voucher_remaining_value
             FROM `order` o
             LEFT JOIN vouchers v
               ON o.voucher_id = v.id
             JOIN user u
               ON o.user_id = u.id
             WHERE o.id = ?
               AND o.user_id = ?
             LIMIT 1"
        );

        $stmt->bind_param(
            "ii",
            $orderId,
            $userId
        );

        $stmt->execute();

        $orderData = $stmt
            ->get_result()
            ->fetch_assoc();

        return $orderData ? new Order($orderData) : null;
    }

    /**
     * Retrieves all visible items for an order.
     * Removed items are excluded from the customer order view.
     *
     * @param int $orderId Order identifier
     * @return array Array of order item data arrays
     */
    public function getOrderItems(int $orderId): array
    {
        $stmt = $this->db->prepare(
            "SELECT p.name,
                    oi.unit_price AS price,
                    p.file_path,
                    oi.quantity
             FROM order_item oi
             JOIN product p
               ON oi.product_id = p.id
             WHERE oi.order_id = ?
               AND (oi.removed = 0 OR oi.removed IS NULL)
             ORDER BY oi.id"
        );

        $stmt->bind_param("i", $orderId);
        $stmt->execute();

        return $stmt
            ->get_result()
            ->fetch_all(MYSQLI_ASSOC);
    }
}