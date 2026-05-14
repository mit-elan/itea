<?php
/**
 * OrderHandler
 * Sprint 2: Bestellung aufgeben, einsehen
 */
class OrderHandler {
    private DataHandler $dh;
    public function __construct(DataHandler $dh) { $this->dh = $dh; }

    public function handle(string $method): ?array {
        return match($method) {
            'placeOrder'  => $this->placeOrder(),
            // 'getMyOrders' => $this->getMyOrders(),
            // 'getDetails'  => $this->getOrderDetails(),
            default => null,
        };
    }

    private function placeOrder(): array
    {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            return ['success' => false, 'error' => 'Not logged in'];
        }

        $cart = $_SESSION['cart'] ?? [];
        if (empty($cart)) {
            return ['success' => false, 'error' => 'Cart is empty'];
        }

        $items = [];
        $total = 0.0;
        foreach ($cart as $productId => $quantity) {
            $product = $this->dh->getProductById((int)$productId);
            if (!$product) continue;
            $unitPrice = (float)$product['price'];
            $total    += $unitPrice * $quantity;
            $items[]   = [
                'product_id' => (int)$productId,
                'quantity'   => $quantity,
                'unit_price' => $unitPrice,
            ];
        }

        $result = $this->dh->createOrder((int)$userId, $total, $items);

        $_SESSION['cart'] = [];

        return [
            'success'       => true,
            'orderId'       => $result['orderId'],
            'invoiceNumber' => $result['invoiceNumber'],
        ];
    }
}
