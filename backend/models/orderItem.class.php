<?php
/** Sprint 2 – OrderItem Model */
class OrderItem {
    public int   $id;
    public int   $orderId;
    public int   $productId;
    public int   $quantity;
    public float $unitPrice;
    public bool  $removed;

    public function __construct(array $data) {
        $this->id        = $data['id']         ?? 0;
        $this->orderId   = $data['order_id']   ?? 0;
        $this->productId = $data['product_id'] ?? 0;
        $this->quantity  = $data['quantity']   ?? 1;
        $this->unitPrice =  $data['unit_price'] ?? 0;
        $this->removed   = $data['removed']   ?? false;
    }

    public function toArray(): array {
        return [
            'id'         => $this->id,
            'product_id' => $this->productId,
            'quantity'   => $this->quantity,
            'unit_price' => $this->unitPrice,
            'removed'    => $this->removed,
        ];
    }
}
