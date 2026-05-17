<?php
require_once __DIR__ . '/../models/order.class.php';

class OrderHandler
{
    private DataHandler $dh;
    public function __construct(DataHandler $dh)
    {
        $this->dh = $dh;
    }

    public function handle(string $method, array $data = []): ?array
    {
        return match ($method) {
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

        $paymentMethodId = isset($_POST['paymentMethodId']) ? (int)$_POST['paymentMethodId'] : 0;
        if (!$paymentMethodId) {
            return ['success' => false, 'error' => 'No payment method selected'];
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

        $order = new Order([
            'user_id'           => (int)$userId,
            'payment_method_id' => $paymentMethodId,
            'total_price'       => $total,
        ]);
        $order->items = $items;

        $result = $this->dh->createOrder($order);

        $_SESSION['cart'] = [];
        $this->dh->deleteCart($userId);

        return [
            'success'       => true,
            'orderId'       => $result['orderId'],
            'invoiceNumber' => $result['invoiceNumber'],
        ];
    }
}
