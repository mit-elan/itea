<?php

/**
 * OrderHandler
 * Sprint 2: Bestellung aufgeben, einsehen
 */

require_once __DIR__ . '/../db/orderDataHandler.php';
require_once __DIR__ . '/../db/productDataHandler.php';
require_once __DIR__ . '/../models/order.class.php';
//Test
class OrderHandler
{
    private OrderDataHandler $orderDataHandler;
    private ProductDataHandler $productDataHandler;
    private ?VoucherDataHandler $voucherDataHandler;

    public function __construct(
        OrderDataHandler $orderDataHandler,
        ProductDataHandler $productDataHandler,
        ?VoucherDataHandler $voucherDataHandler = null
    ) {
        $this->orderDataHandler = $orderDataHandler;
        $this->productDataHandler = $productDataHandler;
        $this->voucherDataHandler = $voucherDataHandler;
    }

    public function handle(
        string $method,
        array $data = []
    ): ?array {

        return match ($method) {
            'placeOrder' => $this->placeOrder($data),
            'getOrders' => $this->getOrders(),
            'getOrderById' => $this->getOrderById($data),
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

    private function getOrderById(array $data): array
    {
        if (!isset($_SESSION['user_id'])) {

            return [
                'error' => 'You must be logged in'
            ];
        }

        $orderId = intval($data['id'] ?? $data['orderId'] ?? 0);

        if (!$orderId) {
            return [
                'error' => 'Order ID is missing'
            ];
        }

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

        $paymentMethodId = isset($data['paymentMethodId']) ? (int) $data['paymentMethodId'] : 0;
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

        // Gutschein anwenden falls übergeben – erst hier wird er tatsächlich eingelöst
        $initialPrice = $total;
        $voucher = null;
        $voucherDiscount = null;
        $voucherRemaining = null;

        $voucherCode = trim($data['appliedVoucherCode'] ?? '');
        if ($voucherCode && $this->voucherDataHandler) {
            $voucher = $this->voucherDataHandler->getVoucherByCode($voucherCode);

            if (!$voucher) {
                return ['code' => 404, 'error' => 'Voucher not found'];
            }

            if ($voucher->user_id !== 0 && $voucher->user_id !== $userId) {
                return ['code' => 400, 'error' => 'Voucher already in use'];
            }

            if ($voucher->redeemed) {
                return ['code' => 400, 'error' => 'Voucher has already been redeemed'];
            }

            if (new DateTime($voucher->valid_until) <= new DateTime()) {
                return ['code' => 400, 'error' => 'Voucher has expired'];
            }

            if ($voucher->user_id === 0) {
                $this->voucherDataHandler->assignVoucherToUser($voucher, $userId);
            }

            $originalTotal = $total;
            $voucherRemaining = round(max(0.0, $voucher->remaining_value - $total), 2);
            $total = $this->voucherDataHandler->redeemVoucher($voucher, $total);
            $voucherDiscount = round($originalTotal - $total, 2);
        }

        $order = new Order([
            'user_id' => (int) $userId,
            'payment_method_id' => $paymentMethodId,
            'initial_price' => $initialPrice,
            'total_price' => $total,
            'voucher_id' => $voucher?->id,
            'voucher_discount' => $voucherDiscount,
            'voucher_remaining_value' => $voucherRemaining,
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
