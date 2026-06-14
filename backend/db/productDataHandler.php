<?php

require_once __DIR__ . '/dbaccess.php';
require_once __DIR__ . '/../models/product.class.php';
require_once __DIR__ . '/../models/category.class.php';

/**
 * Data access layer for product and category persistence.
 * Handles all database operations for product catalog management.
 */
class ProductDataHandler
{
    private mysqli $db;

    /**
     * Initializes the product data handler with a database connection.
     *
     * @param DBaccess $db Database connection handler
     */
    public function __construct(DBaccess $db)
    {
        $this->db = $db->getConnection();
    }

    /**
     * Retrieves all products from the database.
     *
     * @return array Array of Product objects
     */
    public function getProducts(): array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM product ORDER BY id"
        );
        $stmt->execute();

        return array_map(
            fn(array $row) => new Product($row),
            $stmt->get_result()->fetch_all(MYSQLI_ASSOC)
        );
    }

    /**
     * Retrieves all products in a specific category.
     *
     * @param int $categoryId Category identifier
     * @return array Array of Product objects for the category
     */
    public function getProductsByCategory(int $categoryId): array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM product WHERE category_id = ? ORDER BY id"
        );
        $stmt->bind_param("i", $categoryId);
        $stmt->execute();

        return array_map(
            fn(array $row) => new Product($row),
            $stmt->get_result()->fetch_all(MYSQLI_ASSOC)
        );
    }

    /**
     * Retrieves a single product by ID.
     *
     * @param int $id Product identifier
     * @return Product|null Product object if found, null otherwise
     */
    public function getProductById(int $id): ?Product
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM product WHERE id = ?"
        );
        $stmt->bind_param("i", $id);
        $stmt->execute();

        $row = $stmt->get_result()->fetch_assoc();

        return $row ? new Product($row) : null;
    }

    /**
     * Retrieves all categories sorted by name.
     *
     * @return array Array of serialized category data arrays
     */
    public function getCategories(): array
    {
        $stmt = $this->db->prepare(
            "SELECT id, name FROM category ORDER BY name"
        );
        $stmt->execute();

        return array_map(
            fn(array $row) => (new Category($row))->toArray(),
            $stmt->get_result()->fetch_all(MYSQLI_ASSOC)
        );
    }

    /**
     * Creates a new product in the database.
     *
     * @param Product $product Product object with properties to insert
     * @return void
     */
    public function createProduct(Product $product): void
    {
        $stmt = $this->db->prepare(
            "INSERT INTO product (
                category_id,
                name,
                description,
                price,
                rating,
                file_path
            ) VALUES (?, ?, ?, ?, ?, ?)"
        );

        $stmt->bind_param(
            "issdds",
            $product->categoryId,
            $product->name,
            $product->description,
            $product->price,
            $product->rating,
            $product->filePath
        );

        $stmt->execute();
    }

    /**
     * Deletes a product from the database.
     *
     * @param int $id Product identifier to delete
     * @return void
     */
    public function deleteProduct(int $id): void
    {
        $stmt = $this->db->prepare(
            "DELETE FROM product WHERE id = ?"
        );
        $stmt->bind_param("i", $id);
        $stmt->execute();
    }

    /**
     * Updates an existing product in the database.
     *
     * @param Product $product Product object with updated properties and ID
     * @return void
     */
    public function updateProduct(Product $product): void
    {
        $stmt = $this->db->prepare(
            "UPDATE product
             SET category_id = ?,
                 name = ?,
                 description = ?,
                 price = ?,
                 rating = ?,
                 file_path = ?
             WHERE id = ?"
        );

        $stmt->bind_param(
            "issddsi",
            $product->categoryId,
            $product->name,
            $product->description,
            $product->price,
            $product->rating,
            $product->filePath,
            $product->id
        );

        $stmt->execute();
    }
}