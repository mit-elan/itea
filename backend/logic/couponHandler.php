<?php
/**
 * CouponHandler
 * Sprint 4: Gutschein einlösen
 */
class CouponHandler {
    private DataHandler $dh;
    public function __construct(DataHandler $dh) { $this->dh = $dh; }

    public function handle(string $method): ?array {
        return match($method) {
            // Sprint 4
            // 'validate' => $this->validate(),
            // 'redeem'   => $this->redeem(),
            default => null,
        };
    }
}
