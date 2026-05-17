<?php

/**
 * OrderHandler
 * Sprint 2: Bestellung aufgeben, einsehen
 */

require_once __DIR__ . '/../config/orderDataHandler.php';
require_once __DIR__ . '/../config/dataHandler.php';
require_once __DIR__ . '/../models/order.class.php';

class OrderHandler
{
    private OrderDataHandler $odh;
    private DataHandler $dh;

    public function __construct(
    OrderDataHandler $odh,
    DataHandler $dh
) {
    $this->odh = $odh;
    $this->dh = $dh;
}

public function handle(
    string $method,
    array $data = []
): ?array {

    return match ($method) {
        'placeOrder' => $this->placeOrder(),
        'getOrders' => $this->getOrders(),
        'getOrderById' => $this->getOrderById(),
        default => null,
    };
}

    private function getOrders(): array
    {
        if (!isset($_SESSION['user_id'])) {

            return [
                'error' => 'You must be logged in'
            ];
        }

        return $this->odh->getOrdersByUser(
            $_SESSION['user_id']
        );
    }

    private function getOrderById(): array
    {
        if (!isset($_SESSION['user_id'])) {

            return [
                'error' => 'You must be logged in'
            ];
        }

        $orderId = intval($_GET['id'] ?? 0);

        $order = $this->odh->getOrderById(
            $orderId,
            $_SESSION['user_id']
        );

        if (!$order) {

            return [
                'error' => 'Order not found'
            ];
        }

        $items = $this->odh->getOrderItems(
            $orderId
        );

        return [
            'order' => $order,
            'items' => $items
        ];
    }

    private function placeOrder(): array
    {
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {

            return [
                'success' => false,
                'error' => 'Not logged in'
            ];
        }

        $paymentMethodId = isset($_POST['paymentMethodId']) ? (int)$_POST['paymentMethodId'] : 0;
        if (!$paymentMethodId) {
            return ['success' => false, 'error' => 'No payment method selected'];
        }

        $cart = $_SESSION['cart'] ?? [];

        if (empty($cart)) {

            return [
                'success' => false,
                'error' => 'Cart is empty'
            ];
        }

        $items = [];

        $total = 0.0;

        foreach ($cart as $productId => $quantity) {

            $product = $this->dh->getProductById(
                (int) $productId
            );

            if (!$product) {
                continue;
            }

            $unitPrice = (float) $product['price'];

            $total += $unitPrice * $quantity;

            $items[] = [
                'product_id' => (int) $productId,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
            ];
        }

        $order = new Order([
            'user_id'           => (int)$userId,
            'payment_method_id' => $paymentMethodId,
            'total_price'       => $total,
        ]);
        $order->items = $items;

        $result = $this->odh->createOrder($order);

        $_SESSION['cart'] = [];

        return [
            'success' => true,
            'orderId' => $result['orderId'],
            'invoiceNumber' => $result['invoiceNumber'],
        ];
    }
}