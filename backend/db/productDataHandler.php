<?php

require_once __DIR__ . '/dbaccess.php';
require_once __DIR__ . '/../models/product.class.php';
require_once __DIR__ . '/../models/category.class.php';

class ProductDataHandler
{
    private mysqli $db;

    public function __construct(DBaccess $db)
    {
        $this->db = $db->getConnection();
    }

    public function getProducts(): array
    {
        $result = $this->db->query("SELECT * FROM product");
        return array_map(
            fn(array $row) => new Product($row),
            $result->fetch_all(MYSQLI_ASSOC)
        );
    }

    public function getProductsByCategory(int $categoryId): array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM product WHERE category_id = ?"
        );
        $stmt->bind_param("i", $categoryId);
        $stmt->execute();
        return array_map(
            fn(array $row) => new Product($row),
            $stmt->get_result()->fetch_all(MYSQLI_ASSOC)
        );
    }

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

    public function getCategories(): array
    {
        $result = $this->db->query("SELECT id, name FROM category ORDER BY name");
        return array_map(
            fn(array $row) => (new Category($row))->toArray(),
            $result->fetch_all(MYSQLI_ASSOC)
        );
    }

    public function createProduct(Product $product): void
    {
        $stmt = $this->db->prepare(
            "INSERT INTO product (category_id, name, description, price, rating, file_path) VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->bind_param(
            "issdis",
            $product->categoryId,
            $product->name,
            $product->description,
            $product->price,
            $product->rating,
            $product->filePath
        );
        $stmt->execute();
    }

    public function deleteProduct(int $id): void
    {
        $stmt = $this->db->prepare("DELETE FROM product WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
    }

    public function updateProduct(Product $product): void
    {
        $stmt = $this->db->prepare(
            "UPDATE product SET category_id=?, name=?, description=?, price=?, rating=?, file_path=? WHERE id=?"
        );
        $stmt->bind_param(
            "issdisi",
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