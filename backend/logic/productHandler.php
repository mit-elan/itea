<?php
/**
 * ProductHandler
 * Sprint 1: Produkte listen, Kategorien, Suche
 */
class ProductHandler {
    private DataHandler $dh;
    public function __construct(DataHandler $dh) { $this->dh = $dh; }

    public function handle(string $method): ?array {
        return match($method) {
            // Sprint 1
            // 'getAll'         => $this->getAll(),
            // 'getByCategory'  => $this->getByCategory(),
            // 'search'         => $this->search(),
            // 'getCategories'  => $this->getCategories(),
            default => null,
        };
    }
}
