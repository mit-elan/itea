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

        $this->userId           = $data['user_id'] ?? 0;
        $this->isBankAccount    = $data['paymentType']    ?? '';
        $this->cardNumber       = $data['cardNumber'] ?? '';
        $this->label           = $data['paymentName'] ?? '';
    }

    public function toArray(): array
    {
        return [
            'id'      => $this->userId,
            'type'    => $this->isBankAccount,
            'details' => $this->cardNumber,
            'label'   => $this->label
        ];
    }
}
