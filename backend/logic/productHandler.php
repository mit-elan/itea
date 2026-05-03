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
            'getAll'         => $this->getAll(),
            'getById'        => $this->getById(),
            'getByCategory'  => $this->getByCategory(),
            default => null,
        };
    }

    private function getAll(): array
    {
        return $this->dh->getProducts();
    }

    private function getById(): array
    {
        return $this->dh->getProductById($_GET['id']);
    }

    private function getByCategory(): array
    {
        return $this->dh->getProductsByCategory($_GET['id']);
    }
}
