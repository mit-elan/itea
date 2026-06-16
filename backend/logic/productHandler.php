<?php

require_once __DIR__ . '/../models/product.class.php';

/**
 * Business logic handler for product operations
 * Routes requests to appropriate product retrieval, creation, update, and deletion methods
 */
class ProductHandler
{
    private const HTTP_BAD_REQUEST = 400;
    private const HTTP_FORBIDDEN = 403;
    private const HTTP_NOT_FOUND = 404;
    private const HTTP_INTERNAL_SERVER_ERROR = 500;

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
     * @return array Operation result or error details
     */
    public function handle(string $method, array $data = []): array
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
                return $this->errorResponse(
                    self::HTTP_NOT_FOUND,
                    'Unknown product method'
                );
        }
    }

    /**
     * Creates a standardized error response and sets the matching HTTP status code
     *
     * @param int $code HTTP status code
     * @param string $message Error message for the API response
     * @return array Error response
     */
    private function errorResponse(int $code, string $message): array
    {
        http_response_code($code);

        return [
            'code' => $code,
            'success' => false,
            'error' => $message
        ];
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
     * @param array $data Must contain id
     * @return array Product data array or empty array if not found
     */
    private function getById(array $data): array
    {
        $id = (int)($data['id'] ?? 0);

        if ($id <= 0) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Invalid product id'
            );
        }

        $product = $this->productDataHandler->getProductById($id);

        if (!$product) {
            return $this->errorResponse(
                self::HTTP_NOT_FOUND,
                'Product not found'
            );
        }

        return $product->toArray();
    }

    /**
     * Retrieves all products in a category
     *
     * @param array $data Must contain id
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
     * Handles product image upload
     * Restricted to admin users only. Validates file type and saves to productpictures directory.
     *
     * @return array Response with filePath on success or error details
     */
    private function uploadImage(): array
    {
        // Admin authorization check
        if (($_SESSION['role'] ?? '') !== 'admin') {
            return $this->errorResponse(
                self::HTTP_FORBIDDEN,
                'Unauthorized'
            );
        }

        // Validate uploaded image
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'No valid image uploaded'
            );
        }

        $file = $_FILES['image'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        // Validate image file type
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Invalid file type'
            );
        }

        // Generate unique filename with timestamp to prevent collisions
        $filename = uniqid('product_', true) . '.' . $ext;
        $uploadDir = __DIR__ . '/../../backend/productpictures/';

        if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
            return $this->errorResponse(
                self::HTTP_INTERNAL_SERVER_ERROR,
                'Failed to save image'
            );
        }

        return [
            'filePath' => $filename
        ];
    }

    /**
     * Creates a new product
     * Restricted to admin users only. All fields including image file_path must be pre-uploaded.
     *
     * @param array $data Product data including categoryId, name, description, price, rating, filePath
     * @return array Success message with product name or error details
     */
    private function create(array $data): array
    {
        // Admin authorization check
        if (($_SESSION['role'] ?? '') !== 'admin') {
            return $this->errorResponse(
                self::HTTP_FORBIDDEN,
                'Unauthorized'
            );
        }

        $product = new Product([
            'category_id' => (int)($data['categoryId'] ?? 0),
            'name' => trim($data['name'] ?? ''),
            'description' => trim($data['description'] ?? ''),
            'price' => (float)($data['price'] ?? 0),
            'rating' => (float)($data['rating'] ?? 0),
            'file_path' => trim($data['filePath'] ?? ''),
        ]);

        // Validate all required fields are present
        if (
            !$product->name ||
            !$product->description ||
            !$product->price ||
            !$product->categoryId ||
            !$product->filePath
        ) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Missing required fields'
            );
        }

        // Validate price is positive
        if ($product->price <= 0) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Price must be greater than 0'
            );
        }

        // Create product in database
        $this->productDataHandler->createProduct($product);

        return [
            'message' => 'Product created successfully',
            'name' => $product->name
        ];
    }

    /**
     * Updates an existing product
     * Restricted to admin users only. If product ID does not exist, cleans up the uploaded image file before returning error.
     *
     * @param array $data Product data including id, categoryId, name, description, price, rating, filePath
     * @return array Success message with product name or error details
     */
    private function update(array $data): array
    {
        // Admin authorization check
        if (($_SESSION['role'] ?? '') !== 'admin') {
            return $this->errorResponse(
                self::HTTP_FORBIDDEN,
                'Unauthorized'
            );
        }

        $product = new Product([
            'id' => (int)($data['id'] ?? 0),
            'category_id' => (int)($data['categoryId'] ?? 0),
            'name' => trim($data['name'] ?? ''),
            'description' => trim($data['description'] ?? ''),
            'price' => (float)($data['price'] ?? 0),
            'rating' => (float)($data['rating'] ?? 0),
            'file_path' => trim($data['filePath'] ?? ''),
        ]);

        // Validate all required fields are present
        if (
            !$product->id ||
            !$product->name ||
            !$product->description ||
            !$product->price ||
            !$product->categoryId ||
            !$product->filePath
        ) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Missing required fields'
            );
        }

        // Validate price is positive
        if ($product->price <= 0) {
            $this->deleteUploadedProductImage($product->filePath);

            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Price must be greater than 0'
            );
        }

        // Validate product exists before updating
        $existing = $this->productDataHandler->getProductById((int)$product->id);

        if (!$existing) {
            $this->deleteUploadedProductImage($product->filePath);

            return $this->errorResponse(
                self::HTTP_NOT_FOUND,
                'Product not found'
            );
        }

        // Update product in database
        $this->productDataHandler->updateProduct($product);

        return [
            'message' => 'Product updated successfully',
            'name' => $product->name
        ];
    }

    /**
     * Deletes a product and its associated image file
     * Restricted to admin users only. Image is deleted before database record to prevent orphaned files.
     *
     * @param array $data Must contain id
     * @return array Success message or error details
     */
    private function delete(array $data): array
    {
        // Admin authorization check
        if (($_SESSION['role'] ?? '') !== 'admin') {
            return $this->errorResponse(
                self::HTTP_FORBIDDEN,
                'Unauthorized'
            );
        }

        // Validate product ID
        $id = (int)($data['id'] ?? 0);

        if ($id <= 0) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Missing product id'
            );
        }

        // Validate product exists before deleting
        $product = $this->productDataHandler->getProductById($id);

        if (!$product) {
            return $this->errorResponse(
                self::HTTP_NOT_FOUND,
                'Product not found'
            );
        }

        // Delete image file before database record for cleanup integrity
        $this->deleteUploadedProductImage($product->filePath);

        // Delete product in database
        $this->productDataHandler->deleteProduct($id);

        return [
            'message' => 'Product deleted successfully'
        ];
    }

    /**
     * Deletes an uploaded product image file if it exists
     *
     * @param string $filePath Product image filename
     * @return void
     */
    private function deleteUploadedProductImage(string $filePath): void
    {
        $imagePath = __DIR__ . '/../../backend/productpictures/' . $filePath;

        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
    }
}