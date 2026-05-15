<?php

/** Sprint 2 – PaymentMethod Model */
class PaymentMethod
{
    public int    $userId;
    public int $isBankAccount;
    public string $cardNumber;  // masked display only
    public string $label;

    public function __construct(array $data)
    {
        $this->userId        = $data['user_id'] ?? 0;
        $this->isBankAccount = (int) ($data['is_bank_account'] ?? 0);
        $this->cardNumber    = $data['card_number'] ?? '';
        $this->label         = $data['label'] ?? '';
    }

    public function toArray(): array
    {
        return [
            'label'         => $this->label,
            'cardNumber'    => $this->cardNumber,
            'isBankAccount' => $this->isBankAccount,
        ];
    }
}
