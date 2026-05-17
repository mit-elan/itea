<?php
/** Sprint 2 – Order Model */


class Order {
    public int    $id;
    public int    $userId;
    public ?int   $paymentMethodId;
    public ?int   $voucherId;
    public float  $totalPrice;
    public string $invoiceNumber;
    public string $date;
    public array  $items = [];

    public function __construct(array $data) {
        $this->id              = $data['id']                ?? 0;
        $this->userId          = $data['user_id']           ?? 0;
        $this->paymentMethodId = $data['payment_method_id'] ?? null;
        $this->voucherId       = $data['voucher_id']        ?? null;
        $this->totalPrice      = $data['total_price']       ?? 0;
        $this->invoiceNumber   = $data['invoice_number']    ?? '';
        $this->date            = $data['date']              ?? '';
    }

    public function toArray(): array {
        return [
            'id'             => $this->id,
            'user_id'        => $this->userId,
            'total_price'    => $this->totalPrice,
            'invoice_number' => $this->invoiceNumber,
            'date'           => $this->date,
            'items'          => $this->items,
        ];
    }
}
