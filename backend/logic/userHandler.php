<?php
/**
 * UserHandler
 * Sprint 1: Login, Registrierung
 * Sprint 2: Profil bearbeiten, Zahlungsmethoden
 */
class UserHandler {
    private DataHandler $dh;
    public function __construct(DataHandler $dh) { $this->dh = $dh; }

    public function handle(string $method): ?array {
        return match($method) {
            // Sprint 1
            // 'login'    => $this->login(),
            // 'register' => $this->register(),
            // 'logout'   => $this->logout(),
            // Sprint 2
            // 'getProfile'       => $this->getProfile(),
            // 'updateProfile'    => $this->updateProfile(),
            // 'addPaymentMethod' => $this->addPaymentMethod(),
            default => null,
        };
    }
}
