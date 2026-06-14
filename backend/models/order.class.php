<?php

/**
 * Represents a customer order with invoice, payment, voucher, customer, and item data.
 */
class Order
{
    public int $id;
    public int $userId;
    public ?int $paymentMethodId;
    public ?int $voucherId;
    public ?string $voucherCode;
    public ?float $voucherDiscount;
    public ?float $voucherRemainingValue;
    public float $initialPrice;
    public float $totalPrice;
    public string $invoiceNumber;
    public string $date;
    public string $firstName;
    public string $lastName;
    public string $address;
    public string $zip;
    public string $city;
    public string $email;
    public array $items = [];

    /**
     * Creates an order from database or request data.
     *
     * @param array $data Order data with optional voucher, customer, invoice, and pricing information
     */
    public function __construct(array $data)
    {
        $this->id = (int)($data['id'] ?? 0);
        $this->userId = (int)($data['user_id'] ?? 0);
        $this->paymentMethodId = isset($data['payment_method_id'])
            ? (int)$data['payment_method_id']
            : null;
        $this->voucherId = isset($data['voucher_id'])
            ? (int)$data['voucher_id']
            : null;
        $this->voucherCode = $data['voucher_code'] ?? null;
        $this->voucherDiscount = isset($data['voucher_discount'])
            ? (float)$data['voucher_discount']
            : null;
        $this->voucherRemainingValue = isset($data['voucher_remaining_value'])
            ? (float)$data['voucher_remaining_value']
            : null;
        $this->initialPrice = (float)($data['initial_price'] ?? $data['total_price'] ?? 0);
        $this->totalPrice = (float)($data['total_price'] ?? 0);
        $this->invoiceNumber = $data['invoice_number'] ?? '';
        $this->date = $data['date'] ?? '';
        $this->firstName = $data['first_name'] ?? '';
        $this->lastName = $data['last_name'] ?? '';
        $this->address = $data['address'] ?? '';
        $this->zip = $data['zip'] ?? '';
        $this->city = $data['city'] ?? '';
        $this->email = $data['email'] ?? '';
        $this->items = $data['items'] ?? [];
    }

    /**
     * Converts the order object into an array for API responses.
     *
     * @return array Order data for frontend usage
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->userId,
            'payment_method_id' => $this->paymentMethodId,
            'voucher_id' => $this->voucherId,
            'voucher_code' => $this->voucherCode,
            'voucher_discount' => $this->voucherDiscount,
            'voucher_remaining_value' => $this->voucherRemainingValue,
            'initial_price' => $this->initialPrice,
            'total_price' => $this->totalPrice,
            'invoice_number' => $this->invoiceNumber,
            'date' => $this->date,
            'items' => $this->items,
            'first_name' => $this->firstName,
            'last_name' => $this->lastName,
            'address' => $this->address,
            'zip' => $this->zip,
            'city' => $this->city,
            'email' => $this->email,
        ];
    }
}