<?php

/**
 * Represents a saved payment method for a user.
 *
 * This model is currently not actively instantiated in the payment handlers,
 * but can be used if payment methods are serialized through model objects later.
 */
class PaymentMethod
{
    public int $id;
    public int $userId;
    public int $isBankAccount;
    public string $cardNumber;
    public string $label;

    /**
     * Creates a payment method from database data.
     *
     * @param array $data Payment method data with optional id, user_id, is_bank_account, card_number, and label
     */
    public function __construct(array $data)
    {
        $this->id = (int)($data['id'] ?? 0);
        $this->userId = (int)($data['user_id'] ?? 0);
        $this->isBankAccount = (int)($data['is_bank_account'] ?? 0);
        $this->cardNumber = $data['card_number'] ?? '';
        $this->label = $data['label'] ?? '';
    }

    /**
     * Converts the payment method object into an array for API responses.
     *
     * @return array Payment method data
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->userId,
            'label' => $this->label,
            'card_number' => $this->cardNumber,
            'is_bank_account' => $this->isBankAccount,
        ];
    }
}