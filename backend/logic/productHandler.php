<?php

/**
 * ProductHandler
 * Sprint 1: Produkte listen, Kategorien, Suche
 */
class ProductHandler
{
    private DataHandler $dh;
    public function __construct(DataHandler $dh)
    {
        $this->dh = $dh;
    }

    public function handle(string $method): ?array
    {
        return match ($method) {

            // Sprint 1
            'getAll'         => $this->getAll(),
            'getById'        => $this->getById(),
            'getByCategory'  => $this->getByCategory(),
            //'search'         => $this->search(),
            // 'getCategories'  => $this->getCategories(),
            default => null,
        };
    }

    private function getAll(): array
    {
        return $this->dh->getProducts();
    }

    private function getById(): array
    {
        return $this->dh->getProductById((int)$_GET['id']);
    }

    private function getByCategory(): array
    {
        return $this->dh->getProductsByCategory((int)$_GET['id']);
    }
}
