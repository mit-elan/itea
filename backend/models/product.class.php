<?php

/**
 * Represents a product in the catalog.
 * Handles conversion between database format and API response format.
 */
class Product
{
    public int $id;
    public int $categoryId;
    public string $name;
    public string $description;
    public float $price;
    public float $rating;
    public string $filePath;

    /**
     * Creates a product from database or request data.
     *
     * @param array $data Product data with optional id, category_id, name, description, price, rating, and file_path
     */
    public function __construct(array $data)
    {
        $this->id = (int)($data['id'] ?? 0);
        $this->categoryId = (int)($data['category_id'] ?? 0);
        $this->name = $data['name'] ?? '';
        $this->description = $data['description'] ?? '';
        $this->price = (float)($data['price'] ?? 0);
        $this->rating = (float)($data['rating'] ?? 0);
        $this->filePath = $data['file_path'] ?? '';
    }

    /**
     * Converts the product object into an array for API responses.
     * Uses camelCase keys for frontend usage.
     *
     * @return array Product data for frontend usage
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'categoryId' => $this->categoryId,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'rating' => $this->rating,
            'filePath' => $this->filePath,
        ];
    }
}