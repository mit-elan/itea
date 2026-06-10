<?php

/**
 * Represents a product in the catalog
 * Handles conversion between database format (snake_case) and API format (camelCase)
 */
class Product {
    public int    $id;
    public int    $categoryId;
    public string $name;
    public string $description;
    public float  $price;
    public float  $rating;
    public string $filePath;

    /**
     * @param array $data Product data with snake_case keys from database (id, category_id, name, description, price, rating, file_path)
     */
    public function __construct(array $data) {
        $this->id          = $data['id']          ?? 0;
        $this->categoryId  = $data['category_id'] ?? 0;
        $this->name        = $data['name']        ?? '';
        $this->description = $data['description'] ?? '';
        $this->price       = (float)($data['price']  ?? 0);
        $this->rating      = (float)($data['rating'] ?? 0);
        $this->filePath    = $data['file_path']   ?? '';
    }

    /**
     * Serializes product to array format for API responses
     * Converts property names to camelCase for client consumption
     *
     * @return array Product data with camelCase keys
     */
    public function toArray(): array {
        return [
            'id'          => $this->id,
            'categoryId'  => $this->categoryId,
            'name'        => $this->name,
            'description' => $this->description,
            'price'       => $this->price,
            'rating'      => $this->rating,
            'filePath'    => $this->filePath,
        ];
    }
}
