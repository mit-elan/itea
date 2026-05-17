<?php
/** Sprint 1 – Product Model */
class Product {
    public int    $id;
    public int    $categoryId;
    public string $name;
    public string $description;
    public float  $price;
    public int    $rating;
    public string $filePath;

    public function __construct(array $data) {
        $this->id          = $data['id']          ?? 0;
        $this->categoryId  = $data['category_id'] ?? 0;
        $this->name        = $data['name']        ?? '';
        $this->description = $data['description'] ?? '';
        $this->price       = (float)($data['price']  ?? 0);
        $this->rating      = (int)($data['rating']   ?? 0);
        $this->filePath    = $data['file_path']   ?? '';
    }

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
