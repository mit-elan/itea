<?php
/** Sprint 4 – Coupon Model */
class Coupon {
    public int     $id;
    public string  $code;
    public float   $value;
    public string  $validUntil;
    public ?int    $redeemedBy;
    public ?string $redeemedAt;

    public function __construct(array $data) {
        $this->id         = $data['id']          ?? 0;
        $this->code       = $data['code']        ?? '';
        $this->value      = $data['value'] ?? 0;
        $this->validUntil = $data['valid_until'] ?? '';
        $this->redeemedBy = $data['redeemed_by'] ?? null;
        $this->redeemedAt = $data['redeemed_at'] ?? null;
    }

    public function isExpired(): bool {
        return !empty($this->validUntil) && strtotime($this->validUntil) < time();
    }

    public function isRedeemed(): bool {
        return $this->redeemedBy !== null;
    }

    public function toArray(): array {
        return [
            'id'          => $this->id,
            'code'        => $this->code,
            'value'       => $this->value,
            'valid_until' => $this->validUntil,
            'redeemed'    => $this->isRedeemed(),
            'expired'     => $this->isExpired(),
        ];
    }
}
