<?php

require_once __DIR__ . '/dbaccess.php';
require_once __DIR__ . '/../models/cart.class.php';

class CartDataHandler
{
    private mysqli $db;

    /**
     * @param DBaccess $db Database access handler
     */
    public function __construct(DBaccess $db)
    {
        $this->db = $db->getConnection();
    }

    /**
     * @param int $userId User ID
     * @param array $cartItems Cart items to persist
     * @return void
     */
    public function saveCartToDb(int $userId, array $cartItems): void
    {
        // Full cart replacement: delete existing and insert new state (not incremental updates)
        $stmt = $this->db->prepare(
            "DELETE FROM cart WHERE user_id = ?"
        );
        $stmt->bind_param("i", $userId);
        $stmt->execute();

        if (empty($cartItems)) {
            return;
        }

        $stmt = $this->db->prepare(
            "INSERT INTO cart (user_id, product_id, quantity)
             VALUES (?, ?, ?)"
        );

        foreach ($cartItems as $cartItem) {
            // Skip zero or negative quantities; only persist valid cart state
            if ($cartItem->quantity > 0) {
                $stmt->bind_param(
                    "iii",
                    $cartItem->user_id,
                    $cartItem->product_id,
                    $cartItem->quantity
                );
                $stmt->execute();
            }
        }
    }

    /**
     * @param int $userId User ID
     * @return array List of Cart objects
     */
    public function loadCartFromDb(int $userId): array
    {
        $stmt = $this->db->prepare(
            "SELECT product_id, quantity FROM cart WHERE user_id = ?"
        );
        $stmt->bind_param("i", $userId);
        $stmt->execute();

        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        // Transform database rows to Cart objects (snake_case columns → camelCase constructor params)
        return array_map(
            fn(array $row) => new Cart([
                'userId'    => $userId,
                'productId' => $row['product_id'],
                'quantity'  => $row['quantity'],
            ]),
            $rows
        );
    }
}
