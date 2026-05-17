<?php

require_once __DIR__ . '/dbaccess.php';
require_once __DIR__ . '/../models/product.class.php';

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
}