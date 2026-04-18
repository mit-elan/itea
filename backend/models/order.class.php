<?php
/** Sprint 2 – Order Model */
class Order {
    public int    $id;
    public int    $userId;
    public ?int   $paymentMethodId;
    public ?int   $couponId;
    public float  $total;
    public string $invoiceNumber;
    public string $createdAt;
    public array  $items = [];

    public function __construct(array $data) {
        $this->id              = $data['id']                ?? 0;
        $this->userId          = $data['user_id']           ?? 0;
        $this->paymentMethodId = $data['payment_method_id'] ?? null;
        $this->couponId        = $data['coupon_id']         ?? null;
        $this->total           = $data['total']     ?? 0;
        $this->invoiceNumber   = $data['invoice_number']    ?? '';
        $this->createdAt       = $data['created_at']        ?? '';
    }

    public function toArray(): array {
        return [
            'id'             => $this->id,
            'user_id'        => $this->userId,
            'total'          => $this->total,
            'invoice_number' => $this->invoiceNumber,
            'created_at'     => $this->createdAt,
            'items'          => $this->items,
        ];
    }
}
