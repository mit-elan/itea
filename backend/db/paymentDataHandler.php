<?php

require_once __DIR__ . '/dbaccess.php';

/**
 * Data access layer for payment method persistence.
 * Handles loading, creating, and deleting saved payment methods for users.
 */
class PaymentDataHandler
{
    private mysqli $db;

    /**
     * Initializes the payment data handler with a database connection.
     *
     * @param DBaccess $db Database connection handler
     */
    public function __construct(DBaccess $db)
    {
        $this->db = $db->getConnection();
    }

    /**
     * Retrieves all saved payment methods for a user.
     *
     * @param int $userId User identifier
     * @return array Array of payment method data arrays
     */
    public function getPaymentMethodsByUserId(int $userId): array
    {
        $stmt = $this->db->prepare(
            "SELECT id,
                    is_bank_account,
                    card_number,
                    label
             FROM payment_method
             WHERE user_id = ?
             ORDER BY id"
        );

        $stmt->bind_param("i", $userId);
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    /**
     * Creates a new saved payment method for a user.
     *
     * @param int $userId User identifier
     * @param array $data Payment method data with paymentType, cardNumber, and paymentName
     * @return bool True if the payment method was created successfully
     */
    public function createPaymentMethod(int $userId, array $data): bool
    {
        $isBankAccount = ($data['paymentType'] ?? '') === '1' ? 1 : 0;
        $cardNumber = trim($data['cardNumber'] ?? '');
        $label = trim($data['paymentName'] ?? '');

        $stmt = $this->db->prepare(
            "INSERT INTO payment_method (
                user_id,
                is_bank_account,
                card_number,
                label
            ) VALUES (?, ?, ?, ?)"
        );

        if (!$stmt) {
            return false;
        }

        $stmt->bind_param(
            "iiss",
            $userId,
            $isBankAccount,
            $cardNumber,
            $label
        );

        return $stmt->execute();
    }

    /**
     * Deletes a saved payment method belonging to a specific user.
     *
     * @param int $paymentId Payment method identifier
     * @param int $userId User identifier
     * @return bool True if a matching payment method was deleted
     */
    public function deletePaymentMethod(int $paymentId, int $userId): bool
    {
        $stmt = $this->db->prepare(
            "DELETE FROM payment_method
             WHERE id = ?
               AND user_id = ?"
        );

        $stmt->bind_param("ii", $paymentId, $userId);

        return $stmt->execute() && $stmt->affected_rows > 0;
    }
}