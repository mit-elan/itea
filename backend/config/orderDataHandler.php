<?php

require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/../models/order.class.php';

class OrderDataHandler
{
    private $db;

    public function __construct()
    {
        $this->db = getDatabaseConnection();
    }

    public function createOrder(Order $order): array
    {
        $stmt = $this->db->prepare(
            "INSERT INTO `order`
         (user_id, total_price)
         VALUES (?, ?)"
        );

        $stmt->bind_param(
            "id",
            $order->userId,
            $order->totalPrice
        );

        $stmt->execute();

        $orderId = $stmt->insert_id;

        $invoiceNumber =
            'INV-' .
            date('Ymd') .
            '-' .
            str_pad(
                $orderId,
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
            "INSERT INTO order_item
         (order_id, product_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)"
        );

        foreach ($order->items as $item) {

            $stmt->bind_param(
                "iiid",
                $orderId,
                $item['product_id'],
                $item['quantity'],
                $item['unit_price']
            );

            $stmt->execute();
        }

        return [
            'orderId' => $orderId,
            'invoiceNumber' => $invoiceNumber
        ];
    }


    public function getOrdersByUser(
        int $userId
    ): array {

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

    public function getOrderById(
        int $orderId,
        int $userId
    ): ?Order {

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
                u.email

         FROM `order` o

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

        if (!$orderData) {
            return null;
        }

        $order = new Order($orderData);

        $order->firstName = $orderData['first_name'];
        $order->lastName = $orderData['last_name'];
        $order->address = $orderData['address'];
        $order->zip = $orderData['zip'];
        $order->city = $orderData['city'];
        $order->email = $orderData['email'];

        return $order;
    }

    public function getOrderItems(
        int $orderId
    ): array {

        $stmt = $this->db->prepare(
            "SELECT p.name,
                    p.price,
                    p.file_path,
                    oi.quantity
             FROM order_item oi
             JOIN product p
               ON oi.product_id = p.id
             WHERE oi.order_id = ?"
        );

        $stmt->bind_param("i", $orderId);

        $stmt->execute();

        return $stmt
            ->get_result()
            ->fetch_all(MYSQLI_ASSOC);
    }
}
