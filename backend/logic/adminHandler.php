<?php
/**
 * AdminHandler
 * Sprint 3: Produktverwaltung, Kundenverwaltung
 * Sprint 4: Gutscheinverwaltung
 */
class AdminHandler {
    private DataHandler $dh;
    public function __construct(DataHandler $dh) { $this->dh = $dh; }

    public function handle(string $method): ?array {
        if (!isAdmin()) {
            http_response_code(403);
            return ['error' => 'Forbidden'];
        }
        return match($method) {
            // Sprint 3
            // 'createProduct'   => $this->createProduct(),
            // 'updateProduct'   => $this->updateProduct(),
            // 'deleteProduct'   => $this->deleteProduct(),
            // 'getCustomers'    => $this->getCustomers(),
            // 'setCustomActive' => $this->setCustomerActive(),
            // Sprint 4
            // 'createCoupon'    => $this->createCoupon(),
            // 'getAllCoupons'    => $this->getAllCoupons(),
            default => null,
        };
    }
}
