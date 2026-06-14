<?php

/**
 * Represents a product item within an order.
 *
 * This model is currently not actively instantiated in the order handlers,
 * but can be used if order items are serialized through model objects later.
 */
class OrderItem
{
    public int $id;
    public int $orderId;
    public int $productId;
    public int $quantity;
    public float $unitPrice;
    public bool $removed;

    /**
     * Creates an order item from database data.
     *
     * @param array $data Order item data with optional id, order_id, product_id, quantity, unit_price, and removed
     */
    public function __construct(array $data)
    {
        $this->id = (int)($data['id'] ?? 0);
        $this->orderId = (int)($data['order_id'] ?? 0);
        $this->productId = (int)($data['product_id'] ?? 0);
        $this->quantity = (int)($data['quantity'] ?? 1);
        $this->unitPrice = (float)($data['unit_price'] ?? 0);
        $this->removed = (bool)($data['removed'] ?? false);
    }

    /**
     * Converts the order item object into an array for API responses.
     *
     * @return array Order item data
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->orderId,
            'product_id' => $this->productId,
            'quantity' => $this->quantity,
            'unit_price' => $this->unitPrice,
            'removed' => $this->removed,
        ];
    }
}