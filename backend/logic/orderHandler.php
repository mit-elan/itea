<?php

require_once __DIR__ . '/../db/orderDataHandler.php';
require_once __DIR__ . '/../db/productDataHandler.php';
require_once __DIR__ . '/../models/order.class.php';

/**
 * Business logic handler for order operations
 * Routes requests to order creation and customer order retrieval methods
 */
class OrderHandler
{
    private const HTTP_BAD_REQUEST = 400;
    private const HTTP_UNAUTHORIZED = 401;
    private const HTTP_NOT_FOUND = 404;
    private const HTTP_INTERNAL_SERVER_ERROR = 500;

    private OrderDataHandler $orderDataHandler;
    private ProductDataHandler $productDataHandler;
    private ?VoucherDataHandler $voucherDataHandler;

    /**
     * @param OrderDataHandler $orderDataHandler Data access handler for orders
     * @param ProductDataHandler $productDataHandler Data access handler for product lookups
     * @param VoucherDataHandler|null $voucherDataHandler Optional data access handler for vouchers
     */
    public function __construct(
        OrderDataHandler $orderDataHandler,
        ProductDataHandler $productDataHandler,
        ?VoucherDataHandler $voucherDataHandler = null
    ) {
        $this->orderDataHandler = $orderDataHandler;
        $this->productDataHandler = $productDataHandler;
        $this->voucherDataHandler = $voucherDataHandler;
    }

    /**
     * Routes order operations to appropriate handler methods
     *
     * @param string $method Operation name (placeOrder, getOrders, getOrderById)
     * @param array $data Request data passed to handler methods
     * @return array Operation result or error details
     */
    public function handle(string $method, array $data = []): array
    {
        return match ($method) {
            'placeOrder' => $this->placeOrder($data),
            'getOrders' => $this->getOrders(),
            'getOrderById' => $this->getOrderById($data),

            default => $this->errorResponse(
                self::HTTP_NOT_FOUND,
                'Unknown order method'
            ),
        };
    }

    /**
     * Creates a standardized error response and sets the matching HTTP status code
     *
     * @param int $code HTTP status code
     * @param string $message Error message for the API response
     * @return array Error response
     */
    private function errorResponse(int $code, string $message): array
    {
        http_response_code($code);

        return [
            'code' => $code,
            'error' => $message
        ];
    }

    /**
     * Retrieves all orders for the currently logged-in user
     *
     * @return array Array of customer orders or error details
     */
    private function getOrders(): array
    {
        // User authentication check
        if (!isset($_SESSION['user_id'])) {
            return $this->errorResponse(
                self::HTTP_UNAUTHORIZED,
                'You must be logged in'
            );
        }

        // Load all orders for the current user
        return $this->orderDataHandler->getOrdersByUser(
            (int)$_SESSION['user_id']
        );
    }

    /**
     * Retrieves a single order including its order items for the currently logged-in user
     *
     * @param array $data Must contain id or orderId
     * @return array Response with order and items or error details
     */
    private function getOrderById(array $data): array
    {
        // User authentication check
        if (!isset($_SESSION['user_id'])) {
            return $this->errorResponse(
                self::HTTP_UNAUTHORIZED,
                'You must be logged in'
            );
        }

        // Validate order ID
        $orderId = (int)($data['id'] ?? $data['orderId'] ?? 0);

        if ($orderId <= 0) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Order ID is missing'
            );
        }

        // Load only orders belonging to the current user
        $order = $this->orderDataHandler->getOrderById(
            $orderId,
            (int)$_SESSION['user_id']
        );

        if (!$order) {
            return $this->errorResponse(
                self::HTTP_NOT_FOUND,
                'Order not found'
            );
        }

        // Load all items belonging to the selected order
        $items = $this->orderDataHandler->getOrderItems($orderId);

        return [
            'order' => $order->toArray(),
            'items' => $items
        ];
    }

    /**
     * Places a new order for the currently logged-in user
     * Builds order items from the session cart and optionally applies a voucher
     *
     * @param array $data Order data including paymentMethodId and optional appliedVoucherCode
     * @return array Success response with order data or error details
     */
    private function placeOrder(array $data): array
    {
        $userId = $_SESSION['user_id'] ?? null;

        // User authentication check
        if (!$userId) {
            return $this->errorResponse(
                self::HTTP_UNAUTHORIZED,
                'Not logged in'
            );
        }

        // Validate selected payment method
        $paymentMethodId = isset($data['paymentMethodId'])
            ? (int)$data['paymentMethodId']
            : 0;

        if ($paymentMethodId <= 0) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'No payment method selected'
            );
        }

        // Validate cart state
        $cart = $_SESSION['cart'] ?? [];

        if (empty($cart)) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Cart is empty'
            );
        }

        $items = [];
        $total = 0.0;

        // Build order items from the current session cart
        foreach ($cart as $productId => $quantity) {
            $product = $this->productDataHandler->getProductById(
                (int)$productId
            );

            // Silently skip products that no longer exist
            if (!$product) {
                continue;
            }

            $unitPrice = (float)$product->price;
            $quantity = (int)$quantity;

            $total += $unitPrice * $quantity;

            $items[] = [
                'product_id' => (int)$productId,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
            ];
        }

        // Stop order creation if no valid products were found in the cart
        if (empty($items)) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Cart contains no valid products'
            );
        }

        // Apply voucher if one was submitted. The voucher is only redeemed during order placement.
        $initialPrice = $total;
        $voucher = null;
        $voucherDiscount = null;
        $voucherRemaining = null;

        $voucherCode = trim($data['appliedVoucherCode'] ?? '');

        if ($voucherCode !== '') {
            if (!$this->voucherDataHandler) {
                return $this->errorResponse(
                    self::HTTP_INTERNAL_SERVER_ERROR,
                    'Voucher handling is not available'
                );
            }

            $voucher = $this->voucherDataHandler->getVoucherByCode($voucherCode);

            if (!$voucher) {
                return $this->errorResponse(
                    self::HTTP_NOT_FOUND,
                    'Voucher not found'
                );
            }

            if ($voucher->user_id !== 0 && $voucher->user_id !== (int)$userId) {
                return $this->errorResponse(
                    self::HTTP_BAD_REQUEST,
                    'Voucher already in use'
                );
            }

            if ($voucher->redeemed) {
                return $this->errorResponse(
                    self::HTTP_BAD_REQUEST,
                    'Voucher has already been redeemed'
                );
            }

            if (new DateTime($voucher->valid_until) <= new DateTime()) {
                return $this->errorResponse(
                    self::HTTP_BAD_REQUEST,
                    'Voucher has expired'
                );
            }

            // Assign public voucher to the current user before redeeming it
            if ($voucher->user_id === 0) {
                $this->voucherDataHandler->assignVoucherToUser($voucher, (int)$userId);
            }

            $originalTotal = $total;
            $voucherRemaining = round(max(0.0, $voucher->remaining_value - $total), 2);
            $total = $this->voucherDataHandler->redeemVoucher($voucher, $total);
            $voucherDiscount = round($originalTotal - $total, 2);
        }

        // Create order object including calculated totals and optional voucher data
        $order = new Order([
            'user_id' => (int)$userId,
            'payment_method_id' => $paymentMethodId,
            'initial_price' => $initialPrice,
            'total_price' => $total,
            'voucher_id' => $voucher?->id,
            'voucher_discount' => $voucherDiscount,
            'voucher_remaining_value' => $voucherRemaining,
        ]);

        $order->items = $items;

        // Persist order and related order items
        $result = $this->orderDataHandler->createOrder($order);

        if (!$result || !isset($result['orderId'], $result['invoiceNumber'])) {
            return $this->errorResponse(
                self::HTTP_INTERNAL_SERVER_ERROR,
                'Failed to create order'
            );
        }

        // Clear cart only after successful order creation
        $_SESSION['cart'] = [];

        return [
            'orderId' => $result['orderId'],
            'invoiceNumber' => $result['invoiceNumber'],
        ];
    }
}