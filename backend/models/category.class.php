<?php

/**
 * Represents a product category.
 */
class Category
{
    public int $id;
    public string $name;

    /**
     * Creates a category from database data.
     *
     * @param array $data Category data with optional id and name
     */
    public function __construct(array $data)
    {
        $this->id = (int)($data['id'] ?? 0);
        $this->name = $data['name'] ?? '';
    }

    /**
     * Converts the category object into an array for API responses.
     *
     * @return array Category data
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name
        ];
    }
}