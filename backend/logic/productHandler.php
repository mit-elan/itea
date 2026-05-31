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
        switch ($method) {
            case 'getAll':
                return $this->getAll();
            case 'getById':
                return $this->getById($data);
            case 'getByCategory':
                return $this->getByCategory($data);
            case 'getCategories':
                return $this->getCategories();
            case 'uploadImage':
                return $this->uploadImage();
            case 'create':
                return $this->create($data);
            case 'update':
                return $this->update($data);
            case 'delete':
                return $this->delete($data);
            default:
                return null;
        }
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

    private function getCategories(): array
    {
        return $this->productDataHandler->getCategories();
    }

    private function uploadImage(): array
    {
        if (($_SESSION['role'] ?? '') !== 'admin') {
            return ['code' => 403, 'error' => 'Unauthorized'];
        }

        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            return ['code' => 400, 'error' => 'No valid image uploaded'];
        }

        $file = $_FILES['image'];
        $ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
            return ['code' => 400, 'error' => 'Invalid file type'];
        }

        $filename  = uniqid('product_', true) . '.' . $ext;
        $uploadDir = __DIR__ . '/../../backend/productpictures/';
        if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
            return ['code' => 500, 'error' => 'Failed to save image'];
        }

        return ['filePath' => $filename];
    }

    private function create(array $data): array
    {
        if (($_SESSION['role'] ?? '') !== 'admin') {
            return ['code' => 403, 'error' => 'Unauthorized'];
        }

        $product = new Product([
            'category_id' => (int)($data['categoryId']  ?? 0),
            'name'        => trim($data['name']          ?? ''),
            'description' => trim($data['description']   ?? ''),
            'price'       => (float)($data['price']      ?? 0),
            'rating'      => (int)($data['rating']       ?? 0),
            'file_path'   => trim($data['filePath']      ?? ''),
        ]);

        if (!$product->name || !$product->description || !$product->price || !$product->categoryId || !$product->filePath) {
            return ['code' => 400, 'error' => 'Missing required fields'];
        }

        $this->productDataHandler->createProduct($product);
        return ['message' => 'Product created successfully', 'name' => $product->name];
    }

    private function update(array $data): array
    {
        if (($_SESSION['role'] ?? '') !== 'admin') {
            return ['code' => 403, 'error' => 'Unauthorized'];
        }

        $product = new Product([
            'id'          => (int)($data['id']           ?? 0),
            'category_id' => (int)($data['categoryId']   ?? 0),
            'name'        => trim($data['name']           ?? ''),
            'description' => trim($data['description']    ?? ''),
            'price'       => (float)($data['price']       ?? 0),
            'rating'      => (int)($data['rating']        ?? 0),
            'file_path'   => trim($data['filePath']       ?? ''),
        ]);

        if (!$product->id || !$product->name || !$product->description || !$product->price || !$product->categoryId || !$product->filePath) {
            return ['code' => 400, 'error' => 'Missing required fields'];
        }

        $existing = $this->productDataHandler->getProductById((int)$product->id);
        if (!$existing) {
            if (file_exists(__DIR__ . '/../../backend/productpictures/' . $product->filePath)) {
                unlink(__DIR__ . '/../../backend/productpictures/' . $product->filePath);
            }
            return ['code' => 404, 'error' => 'Product not found'];
        }

        $this->productDataHandler->updateProduct($product);
        return ['message' => 'Product updated successfully', 'name' => $product->name];
    }

    private function delete(array $data): array
    {
        if (($_SESSION['role'] ?? '') !== 'admin') {
            return ['code' => 403, 'error' => 'Unauthorized'];
        }

        $id = (int)($data['id'] ?? 0);
        if (!$id) return ['code' => 400, 'error' => 'Missing product id'];

        $product = $this->productDataHandler->getProductById($id);
        if (!$product) return ['code' => 404, 'error' => 'Product not found'];

        $imagePath = __DIR__ . '/../../backend/productpictures/' . $product->filePath;
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }

        $this->productDataHandler->deleteProduct($id);
        return ['message' => 'Product deleted successfully'];
    }
}
