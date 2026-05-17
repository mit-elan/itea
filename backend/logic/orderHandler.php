<?php

/**
 * OrderHandler
 * Sprint 2: Bestellung aufgeben, einsehen
 */

require_once __DIR__ . '/../db/orderDataHandler.php';
require_once __DIR__ . '/../db/productDataHandler.php';
require_once __DIR__ . '/../models/order.class.php';

class OrderHandler
{
    private OrderDataHandler $orderDataHandler;
    private ProductDataHandler $productDataHandler;

    public function __construct(OrderDataHandler $orderDataHandler, ProductDataHandler $productDataHandler)
    {
        $this->orderDataHandler = $orderDataHandler;
        $this->productDataHandler = $productDataHandler;
    }

    public function handle(
        string $method,
        array $data = []
    ): ?array {

        return match ($method) {
            'placeOrder' => $this->placeOrder($data),
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

        return $this->orderDataHandler->getOrdersByUser(
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

        $order = $this->orderDataHandler->getOrderById(
            $orderId,
            $_SESSION['user_id']
        );

        if (!$order) {

            return [
                'error' => 'Order not found'
            ];
        }

        $items = $this->orderDataHandler->getOrderItems(
            $orderId
        );

        return [
            'order' => $order->toArray(),
            'items' => $items
        ];
    }

    private function placeOrder(array $data): array
    {
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {

            return [
                'success' => false,
                'error' => 'Not logged in'
            ];
        }

        $paymentMethodId = isset($data['paymentMethodId']) ? (int)$data['paymentMethodId'] : 0;
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

            $product = $this->productDataHandler->getProductById(
                (int) $productId
            );

            if (!$product) {
                continue;
            }

            $unitPrice = (float) $product->price;

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

        $result = $this->orderDataHandler->createOrder($order);

        $_SESSION['cart'] = [];

        return [
            'success' => true,
            'orderId' => $result['orderId'],
            'invoiceNumber' => $result['invoiceNumber'],
        ];
    }
}
