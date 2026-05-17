<?php

require_once __DIR__ . '/../models/product.class.php';
class ProductHandler
{
    private ProductDataHandler $productDataHandler;
    public function __construct(ProductDataHandler $productDataHandler)
    {
        $this->productDataHandler = $productDataHandler;
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
            fn(Product $product) => $product->toArray(),
            $this->productDataHandler->getProducts()
        );
    }

    private function getById(array $data): array
    {
        $id      = (int)($data['id'] ?? $_GET['id'] ?? 0);
        $product = $this->productDataHandler->getProductById($id);
        if (!$product) return [];
        return $product->toArray();
    }

    private function getByCategory(array $data): array
    {
        $id = (int)($data['id'] ?? $_GET['id'] ?? 0);
        return array_map(
            fn(Product $product) => $product->toArray(),
            $this->productDataHandler->getProductsByCategory($id)
        );
    }
}
