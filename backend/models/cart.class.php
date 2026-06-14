<?php

/**
 * Represents a cart item with product quantity and user assignment.
 */
class Cart
{
    public int $user_id;
    public int $product_id;
    public int $quantity;

    /**
     * Creates a cart item from request or session data.
     *
     * @param array $data Must contain userId, productId, and quantity
     */
    public function __construct(array $data)
    {
        $this->user_id = (int)$data['userId'];
        $this->product_id = (int)$data['productId'];
        $this->quantity = (int)$data['quantity'];
    }
}