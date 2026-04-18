<?php
/** Sprint 2 – PaymentMethod Model */
class PaymentMethod {
    public int    $id;
    public int    $userId;
    public string $type;
    public string $details;  // masked display only

    public function __construct(array $data) {
        $this->id      = $data['id']      ?? 0;
        $this->userId  = $data['user_id'] ?? 0;
        $this->type    = $data['type']    ?? '';
        $this->details = $data['details'] ?? '';
    }

    public function toArray(): array {
        return [
            'id'      => $this->id,
            'type'    => $this->type,
            'details' => $this->details,
        ];
    }
}
