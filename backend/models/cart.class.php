<?php

/**
 * Represents a cart item with product quantity and userId
 */
class Cart {
    public int $user_id;
    public int $product_id;
    public int $quantity;

    /**
     * @param array $data Must contain 'userId', 'productId', and 'quantity' keys
     */
    public function __construct(array $data) {
        $this->user_id   = $data['userId'];
        $this->product_id = $data['productId'];
        $this->quantity = $data['quantity'];
    }
}
