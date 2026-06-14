<?php

/**
 * Represents a voucher with assignment, remaining value, expiry, and redemption status.
 */
class Voucher
{
    public int $id;
    public int $user_id;
    public string $code;
    public float $value;
    public float $remaining_value;
    public string $valid_until;
    public bool $redeemed;

    /**
     * Creates a voucher from database data.
     *
     * @param array $data Voucher data with id, code, value, valid_until, and optional user_id, remaining_value, redeemed
     */
    public function __construct(array $data)
    {
        $this->id = (int)$data['id'];
        $this->user_id = (int)($data['user_id'] ?? 0);
        $this->code = $data['code'];
        $this->value = (float)$data['value'];
        $this->remaining_value = (float)($data['remaining_value'] ?? $data['value']);
        $this->valid_until = $data['valid_until'];
        $this->redeemed = (bool)($data['redeemed'] ?? false);
    }

    /**
     * Converts the voucher object into an array for API responses.
     * Adds a derived status value based on redemption and expiry state.
     *
     * @return array Voucher data for frontend usage
     */
    public function toArray(): array
    {
        $now = new DateTime();
        $expiry = new DateTime($this->valid_until);

        if ($this->redeemed) {
            $status = 'redeemed';
        } elseif ($expiry < $now) {
            $status = 'expired';
        } else {
            $status = 'active';
        }

        return [
            'code' => $this->code,
            'userId' => $this->user_id ?: null,
            'value' => $this->value,
            'remainingValue' => $this->remaining_value,
            'expiryDate' => $this->valid_until,
            'status' => $status,
        ];
    }
}