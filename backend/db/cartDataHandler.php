<?php

require_once __DIR__ . '/dbaccess.php';
require_once __DIR__ . '/../models/cart.class.php';

/**
 * Data access layer for cart persistence.
 * Handles saving and loading user carts between session state and database storage.
 */
class CartDataHandler
{
    private mysqli $db;

    /**
     * Initializes the cart data handler with a database connection.
     *
     * @param DBaccess $db Database connection handler
     */
    public function __construct(DBaccess $db)
    {
        $this->db = $db->getConnection();
    }

    /**
     * Saves the current cart state for a user.
     * Existing database cart entries are replaced completely by the provided cart state.
     *
     * @param int $userId User identifier
     * @param array $cartItems Array of Cart objects to persist
     * @return void
     */
    public function saveCartToDb(int $userId, array $cartItems): void
    {
        // Delete existing cart entries before inserting the current cart state
        $stmt = $this->db->prepare(
            "DELETE FROM cart WHERE user_id = ?"
        );
        $stmt->bind_param("i", $userId);
        $stmt->execute();

        if (empty($cartItems)) {
            return;
        }

        $stmt = $this->db->prepare(
            "INSERT INTO cart (
                user_id,
                product_id,
                quantity
            ) VALUES (?, ?, ?)"
        );

        foreach ($cartItems as $cartItem) {
            if (!$cartItem instanceof Cart) {
                continue;
            }

            // Persist only valid cart entries with a positive quantity
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
     * Loads the persisted cart for a user.
     *
     * @param int $userId User identifier
     * @return array Array of Cart objects
     */
    public function loadCartFromDb(int $userId): array
    {
        $stmt = $this->db->prepare(
            "SELECT product_id,
                    quantity
             FROM cart
             WHERE user_id = ?"
        );
        $stmt->bind_param("i", $userId);
        $stmt->execute();

        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        return array_map(
            fn(array $row) => new Cart([
                'userId' => $userId,
                'productId' => $row['product_id'],
                'quantity' => $row['quantity'],
            ]),
            $rows
        );
    }
}