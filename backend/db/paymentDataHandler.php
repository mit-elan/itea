<?php

require_once __DIR__ . '/dbaccess.php';
require_once __DIR__ . '/../models/payment.class.php';

class PaymentDataHandler
{
    private mysqli $db;

    public function __construct(DBaccess $db)
    {
        $this->db = $db->getConnection();
    }

    public function getPaymentMethodsByUserId(int $userId): array
    {
        $stmt = $this->db->prepare(
            "SELECT id, is_bank_account, card_number, label
             FROM payment_method
             WHERE user_id = ?"
        );

        $stmt->bind_param("i", $userId);
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function createPaymentMethod(int $userId, array $data)
    {
        $isBankAccount = ($data['paymentType'] ?? '') === '1' ? 1 : 0;
        $cardNumber    = $data['cardNumber'] ?? '';
        $label         = $data['paymentName'] ?? '';

        $stmt = $this->db->prepare(
            "INSERT INTO payment_method (user_id, is_bank_account, card_number, label)
             VALUES (?, ?, ?, ?)"
        );

        $stmt->bind_param("iiss", $userId, $isBankAccount, $cardNumber, $label);
    }

    public function deletePaymentMethod(int $paymentId, int $userId): bool
    {
        $stmt = $this->db->prepare(
            "DELETE FROM payment_method WHERE id = ? AND user_id = ?"
        );

        $stmt->bind_param("ii", $paymentId, $userId);

        return $stmt->execute();
    }
}
