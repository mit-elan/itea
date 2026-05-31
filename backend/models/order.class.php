<?php
/** Sprint 2 – Order Model */
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

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? 0;
        $this->userId = $data['user_id'] ?? 0;
        $this->paymentMethodId = $data['payment_method_id'] ?? null;
        $this->voucherId = $data['voucher_id'] ?? null;
        $this->voucherDiscount = $data['voucher_discount'] ?? null;
        $this->voucherRemainingValue = $data['voucher_remaining_value'] ?? null;
        $this->initialPrice = (float)($data['initial_price'] ?? $data['total_price'] ?? 0);
        $this->totalPrice = $data['total_price'] ?? 0;
        $this->invoiceNumber = $data['invoice_number'] ?? '';
        $this->date = $data['date'] ?? '';
        $this->firstName = $data['first_name'] ?? '';
        $this->lastName = $data['last_name'] ?? '';
        $this->address = $data['address'] ?? '';
        $this->zip = $data['zip'] ?? '';
        $this->city = $data['city'] ?? '';
        $this->email = $data['email'] ?? '';
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->userId,
            'initial_price' => $this->initialPrice,
            'total_price' => $this->totalPrice,
            'voucher_code'            => $this->voucherCode,
            'voucher_discount'        => $this->voucherDiscount,
            'voucher_remaining_value' => $this->voucherRemainingValue,
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
