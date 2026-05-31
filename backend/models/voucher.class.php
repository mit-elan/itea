<?php
class Voucher {
    public int    $id;
    public string $code;
    public float  $value;
    public float  $remaining_value;
    public string $valid_until;
    public bool   $redeemed;

    public function __construct(array $data) {
        $this->id              = (int)$data['id'];
        $this->code            = $data['code'];
        $this->value           = (float)$data['value'];
        $this->remaining_value = (float)($data['remaining_value'] ?? $data['value']);
        $this->valid_until     = $data['valid_until'];
        $this->redeemed        = (bool)($data['redeemed'] ?? false);
    }

    public function toArray(): array {
        $now    = new DateTime();
        $expiry = new DateTime($this->valid_until);

        if ($this->redeemed) {
            $status = 'redeemed';
        } elseif ($expiry < $now) {
            $status = 'expired';
        } else {
            $status = 'active';
        }

        return [
            'code'       => $this->code,
            'value'      => $this->value,
            'remainingValue' => $this->remaining_value,
            'expiryDate' => $this->valid_until,
            'status'     => $status,
        ];
    }
}
