<?php

/**
 * VoucherHandler
 *
 * Manages voucher operations including creation, retrieval, assignment, and application.
 * Handles authorization checks and validation for all voucher-related actions.
 */
class VoucherHandler
{
    private VoucherDataHandler $voucherDataHandler;
    private ProductDataHandler $productDataHandler;

    /**
     * Initializes the VoucherHandler with required dependencies.
     *
     * @param VoucherDataHandler $voucherDataHandler Data handler for voucher operations
     * @param ProductDataHandler $productDataHandler Data handler for product lookups
     */
    public function __construct(VoucherDataHandler $voucherDataHandler, ProductDataHandler $productDataHandler)
    {
        $this->voucherDataHandler = $voucherDataHandler;
        $this->productDataHandler = $productDataHandler;
    }

    /**
     * Handles voucher requests by routing to appropriate methods based on the requested method.
     *
     * @param string $method The method name ('create', 'getAll', 'getByUserId', 'apply', 'addToProfile')
     * @param array $data Optional data array passed to the requested method
     * @return array|null Result array containing response data or error information, or null if method is unknown
     */
    public function handle(string $method, array $data = []): ?array
    {
        switch ($method) {
            case 'create':
                return $this->create($data);
            case 'getAll':
                return $this->getAll();
            case 'getByUserId':
                return $this->getByUserId();
            case 'apply':
                return $this->applyVoucher($data);
            case 'addToProfile':
                return $this->addToProfile($data);
            default:
                return null;
        }
    }

    /**
     * Creates a new voucher with a randomly generated alphanumeric code.
     *
     * Restricted to admin users only. Validates that the value is positive and expiry date is in the future.
     *
     * @param array $data Array containing 'value' (float) and 'validUntil' (date string) keys
     * @return array Response array with success message and voucher code, or error details
     */
    private function create(array $data): array
    {
        if (($_SESSION['role'] ?? '') !== 'admin') {
            return ['code' => 403, 'error' => 'Unauthorized'];
        }

        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $code  = '';
        for ($i = 0; $i < 5; $i++) {
            $code .= $chars[random_int(0, strlen($chars) - 1)];
        }

        $voucher = new Voucher([
            'id'          => 0,
            'code'        => $code,
            'value'       => (float)($data['value'] ?? 0),
            'valid_until' => trim($data['validUntil'] ?? ''),
        ]);

        if (empty($voucher->code) || $voucher->value <= 0 || empty($voucher->valid_until)) {
            return ['code' => 400, 'error' => 'Missing required fields'];
        }

        if (new DateTime($voucher->valid_until) <= new DateTime()) {
            return ['code' => 400, 'error' => 'Expiry date must be in the future'];
        }

        $this->voucherDataHandler->createVoucher($voucher);
        return ['message' => 'Voucher created successfully', 'voucherCode' => $voucher->code];
    }

    /**
     * Retrieves all vouchers in the system.
     *
     * Restricted to admin users only.
     *
     * @return array Array of vouchers converted to array format, or error response for unauthorized access
     */
    private function getAll(): array
    {
        if (($_SESSION['role'] ?? '') !== 'admin') {
            return ['code' => 403, 'error' => 'Unauthorized'];
        }

        return array_map(
            fn(Voucher $voucher) => $voucher->toArray(),
            $this->voucherDataHandler->getVouchers()
        );
    }

    /**
     * Retrieves all vouchers assigned to the currently logged-in user.
     *
     * Requires user to be authenticated via session.
     *
     * @return array Array of user's vouchers in array format, or error response if not authenticated
     */
    private function getByUserId(): array
    {
        if (!isset($_SESSION['user_id'])) {
            return ['code' => 401, 'error' => 'Please log in to view your vouchers'];
        }

        $vouchers = $this->voucherDataHandler->getVouchersByUserId($_SESSION['user_id']);

        return array_map(
            fn(Voucher $voucher) => $voucher->toArray(),
            $vouchers
        );
    }

    /**
     * Assigns a voucher to the currently logged-in user's profile.
     *
     * Validates voucher code exists, is not already assigned to another user, has not been redeemed,
     * and has not expired before assignment.
     *
     * @param array $data Array containing 'code' (string) key with the voucher code
     * @return array Success message with voucher code, or error details if validation fails
     */
    private function addToProfile(array $data): array
    {
        if (!isset($_SESSION['user_id'])) {
            return ['code' => 401, 'error' => 'Please log in to add a voucher to your profile'];
        }

        $code = trim($data['code'] ?? '');
        if (empty($code)) {
            return ['code' => 400, 'error' => 'Missing voucher code'];
        }

        $voucher = $this->voucherDataHandler->getVoucherByCode($code);
        if (!$voucher) {
            return ['code' => 404, 'error' => 'Voucher not found'];
        }

        if ($voucher->user_id !== 0) {
            return ['code' => 400, 'error' => 'Voucher is already in use'];
        }

        if ($voucher->redeemed) {
            return ['code' => 400, 'error' => 'Voucher has already been redeemed'];
        }

        if (new DateTime($voucher->valid_until) <= new DateTime()) {
            return ['code' => 400, 'error' => 'Voucher has expired'];
        }

        $this->voucherDataHandler->assignVoucherToUser(
            $voucher,
            $_SESSION['user_id']
        );

        return ['message' => 'Voucher added to profile successfully', 'voucherCode' => $voucher->code];
    }

    /**
     * Validates and applies a voucher to the user's cart during checkout.
     *
     * Performs validation of voucher without redeeming it (redemption happens at order completion).
     * Calculates discount amount and final order total. Discount cannot exceed cart total.
     *
     * @param array $data Array containing 'code' (string) key with the voucher code
     * @return array Array with 'discount' and 'finalAmount' keys if valid, or error response if validation fails
     */
    private function applyVoucher(array $data): array
    {
        if (!isset($_SESSION['user_id'])) {
            return ['code' => 401, 'error' => 'Please log in to apply a voucher'];
        }

        $code = trim($data['code'] ?? '');
        if (empty($code)) {
            return ['code' => 400, 'error' => 'Missing voucher code'];
        }

        $cart = $_SESSION['cart'] ?? [];
        if (empty($cart)) {
            return ['code' => 400, 'error' => 'Cart is empty'];
        }

        $total = 0.0;
        foreach ($cart as $productId => $quantity) {
            $product = $this->productDataHandler->getProductById((int)$productId);
            if (!$product) continue;
            $total += (float)$product->price * $quantity;
        }

        $voucher = $this->voucherDataHandler->getVoucherByCode($code);
        if (!$voucher) {
            return ['code' => 404, 'error' => 'Voucher not found'];
        }
        if ($voucher->redeemed) {
            return ['code' => 400, 'error' => 'Voucher has already been redeemed'];
        }
        if ($voucher->user_id !== 0 && $voucher->user_id !== (int)$_SESSION['user_id']) {
            return ['code' => 403, 'error' => 'Voucher is already in use'];
        }
        if (new DateTime($voucher->valid_until) <= new DateTime()) {
            return ['code' => 400, 'error' => 'Voucher has expired'];
        }

        $discount = $voucher->remaining_value;
        $finalAmount = $total - $discount;
        if ($finalAmount < 0) {
            $finalAmount = 0;
            $discount = $total;
        }

        return [
            'discount'    => $discount,
            'finalAmount' => $finalAmount,
        ];
    }
}
