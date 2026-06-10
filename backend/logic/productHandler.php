<?php

require_once __DIR__ . '/../models/product.class.php';

/**
 * Business logic handler for product operations
 * Routes requests to appropriate product retrieval, creation, update, and deletion methods
 */
class ProductHandler
{
    private ProductDataHandler $productDataHandler;

    /**
     * @param ProductDataHandler $productDataHandler Data access handler for products
     */
    public function __construct(ProductDataHandler $productDataHandler)
    {
        $this->productDataHandler = $productDataHandler;
    }

    /**
     * Routes product operations to appropriate handler methods
     *
     * @param string $method Operation name (getAll, getById, getByCategory, getCategories, uploadImage, create, update, delete)
     * @param array $data Request data passed to handler methods
     * @return array|null Operation result or null if method not recognized
     */
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

    /**
     * Retrieves all products serialized for API response
     *
     * @return array Array of product data arrays
     */
    private function getAll(): array
    {
        return array_map(
            fn(Product $product) => $product->toArray(),
            $this->productDataHandler->getProducts()
        );
    }

    /**
     * Retrieves a single product by ID
     *
     * @param array $data Must contain 'id' key
     * @return array Product data array or empty array if not found
     */
    private function getById(array $data): array
    {
        $id      = (int)($data['id'] ?? 0);
        $product = $this->productDataHandler->getProductById($id);
        if (!$product) return [];
        return $product->toArray();
    }

    /**
     * Retrieves all products in a category
     *
     * @param array $data Must contain 'id' key
     * @return array Array of product data arrays for the category
     */
    private function getByCategory(array $data): array
    {
        $id = (int)($data['id'] ?? 0);
        return array_map(
            fn(Product $product) => $product->toArray(),
            $this->productDataHandler->getProductsByCategory($id)
        );
    }

    /**
     * Retrieves all product categories
     *
     * @return array Array of category data arrays
     */
    private function getCategories(): array
    {
        return $this->productDataHandler->getCategories();
    }

    /**
     * Handles product image upload (admin-only)
     * Validates file type and saves to productpictures directory
     *
     * @return array Response with filePath on success or error details
     */
    private function uploadImage(): array
    {
        // Admin authorization check
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

        // Generate unique filename with timestamp to prevent collisions
        $filename  = uniqid('product_', true) . '.' . $ext;
        $uploadDir = __DIR__ . '/../../backend/productpictures/';
        if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
            return ['code' => 500, 'error' => 'Failed to save image'];
        }

        return ['filePath' => $filename];
    }

    /**
     * Creates a new product (admin-only)
     * All fields including image file_path must be pre-uploaded
     *
     * @param array $data Product data including categoryId, name, description, price, rating, filePath
     * @return array Success message with product name or error details
     */
    private function create(array $data): array
    {
        // Admin authorization check
        if (($_SESSION['role'] ?? '') !== 'admin') {
            return ['code' => 403, 'error' => 'Unauthorized'];
        }

        $product = new Product([
            'category_id' => (int)($data['categoryId']  ?? 0),
            'name'        => trim($data['name']          ?? ''),
            'description' => trim($data['description']   ?? ''),
            'price'       => (float)($data['price']      ?? 0),
            'rating'      => (float)($data['rating']     ?? 0),
            'file_path'   => trim($data['filePath']      ?? ''),
        ]);

        // Validate all required fields are present
        if (!$product->name || !$product->description || !$product->price || !$product->categoryId || !$product->filePath) {
            return ['code' => 400, 'error' => 'Missing required fields'];
        }

        // Validate price is positive
        if ($product->price <= 0) {
            return ['code' => 400, 'error' => 'Price must be greater than 0'];
        }

        $this->productDataHandler->createProduct($product);
        return ['message' => 'Product created successfully', 'name' => $product->name];
    }

    /**
     * Updates an existing product (admin-only)
     * If product ID doesn't exist, cleans up the uploaded image file before returning error
     *
     * @param array $data Product data including id, categoryId, name, description, price, rating, filePath
     * @return array Success message with product name or error details
     */
    private function update(array $data): array
    {
        // Admin authorization check
        if (($_SESSION['role'] ?? '') !== 'admin') {
            return ['code' => 403, 'error' => 'Unauthorized'];
        }

        $product = new Product([
            'id'          => (int)($data['id']           ?? 0),
            'category_id' => (int)($data['categoryId']   ?? 0),
            'name'        => trim($data['name']           ?? ''),
            'description' => trim($data['description']    ?? ''),
            'price'       => (float)($data['price']       ?? 0),
            'rating'      => (float)($data['rating']      ?? 0),
            'file_path'   => trim($data['filePath']       ?? ''),
        ]);

        // Validate all required fields are present
        if (!$product->id || !$product->name || !$product->description || !$product->price || !$product->categoryId || !$product->filePath) {
            return ['code' => 400, 'error' => 'Missing required fields'];
        }

        // Validate price is positive
        if ($product->price <= 0) {
            // Clean up uploaded image if price is invalid to avoid orphaned files
            if (file_exists(__DIR__ . '/../../backend/productpictures/' . $product->filePath)) {
                unlink(__DIR__ . '/../../backend/productpictures/' . $product->filePath);
            }
            return ['code' => 400, 'error' => 'Price must be greater than 0'];
        }

        $existing = $this->productDataHandler->getProductById((int)$product->id);
        if (!$existing) {
            // Clean up uploaded image if product doesn't exist to avoid orphaned files
            if (file_exists(__DIR__ . '/../../backend/productpictures/' . $product->filePath)) {
                unlink(__DIR__ . '/../../backend/productpictures/' . $product->filePath);
            }
            return ['code' => 404, 'error' => 'Product not found'];
        }

        $this->productDataHandler->updateProduct($product);
        return ['message' => 'Product updated successfully', 'name' => $product->name];
    }

    /**
     * Deletes a product and its associated image file (admin-only)
     * Image is deleted before database record to prevent orphaned files
     *
     * @param array $data Must contain 'id' key
     * @return array Success message or error details
     */
    private function delete(array $data): array
    {
        // Admin authorization check
        if (($_SESSION['role'] ?? '') !== 'admin') {
            return ['code' => 403, 'error' => 'Unauthorized'];
        }

        $id = (int)($data['id'] ?? 0);
        if (!$id) return ['code' => 400, 'error' => 'Missing product id'];

        $product = $this->productDataHandler->getProductById($id);
        if (!$product) return ['code' => 404, 'error' => 'Product not found'];

        // Delete image file before database record for cleanup integrity
        $imagePath = __DIR__ . '/../../backend/productpictures/' . $product->filePath;
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }

        $this->productDataHandler->deleteProduct($id);
        return ['message' => 'Product deleted successfully'];
    }
}
