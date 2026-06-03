<?php

/**
 * VoucherHandler
 * Verwaltet Gutscheine (nur für Admins).
 */
class VoucherHandler
{
    private VoucherDataHandler $voucherDataHandler;
    private ProductDataHandler $productDataHandler;

    public function __construct(VoucherDataHandler $voucherDataHandler, ProductDataHandler $productDataHandler)
    {
        $this->voucherDataHandler = $voucherDataHandler;
        $this->productDataHandler = $productDataHandler;
    }

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

    private function create(array $data): array
    {
        if (($_SESSION['role'] ?? '') !== 'admin') {
            return ['code' => 403, 'error' => 'Unauthorized'];
        }

        // 5-stelligen alphanumerischen Code zufällig generieren
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

        // Nur validieren – kein DB-Write. Gutschein wird erst bei Bestellabschluss eingelöst.
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
            $discount = $total; // Rabatt kann nicht höher sein als der Warenwert
        }

        return [
            'discount'    => $discount,
            'finalAmount' => $finalAmount,
        ];
    }
}
