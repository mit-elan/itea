<?php

require_once __DIR__ . '/../models/product.class.php';
class ProductHandler
{
    private DataHandler $dh;

    public function __construct(DataHandler $dh)
    {
        $this->dh = $dh;
    }

    public function handle(string $method, array $data = []): ?array
    {
        return match ($method) {
            'getAll'        => $this->getAll(),
            'getById'       => $this->getById($data),
            'getByCategory' => $this->getByCategory($data),
            default         => null,
        };
    }

    private function getAll(): array
    {
        return array_map(
            fn(array $row) => (new Product($row))->toArray(),
            $this->dh->getProducts()
        );
    }

    private function getById(array $data): array
    {
        $id = (int)($data['id'] ?? $_GET['id'] ?? 0);
        $row = $this->dh->getProductById($id);
        if (empty($row)) return [];
        return (new Product($row))->toArray();
    }

    private function getByCategory(array $data): array
    {
        $id = (int)($data['id'] ?? $_GET['id'] ?? 0);
        return array_map(
            fn(array $row) => (new Product($row))->toArray(),
            $this->dh->getProductsByCategory($id)
        );
    }
}
