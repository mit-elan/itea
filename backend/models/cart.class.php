<?php
/** Sprint 1 – Category Model */
class Cart {
    public int      $user_id;
    public int      $product_id;
    public int      $quantity;

    public function __construct(array $data) {
        $this->user_id   = $data['userId'];
        $this->product_id = $data['productId'];
        $this->quantity = $data['quantity'];
    }

    public function toArray(): array {
        return ['userId' => $this->user_id, 'productId' => $this->product_id, 'quantity' => $this->quantity];
    }
}
