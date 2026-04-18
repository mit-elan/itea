<?php
/**
 * OrderHandler
 * Sprint 2: Bestellung aufgeben, einsehen
 */
class OrderHandler {
    private DataHandler $dh;
    public function __construct(DataHandler $dh) { $this->dh = $dh; }

    public function handle(string $method): ?array {
        return match($method) {
            // Sprint 2
            // 'placeOrder'  => $this->placeOrder(),
            // 'getMyOrders' => $this->getMyOrders(),
            // 'getDetails'  => $this->getOrderDetails(),
            default => null,
        };
    }
}
