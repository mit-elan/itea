<?php
/** Sprint 1 – Product Model */
class Product {
    public int    $id;
    public int    $categoryId;
    public string $name;
    public string $description;
    public float  $price;
    public int    $rating;
    public string $image;

    public function __construct(array $data) {
        $this->id          = $data['id']          ?? 0;
        $this->categoryId  = $data['category_id'] ?? 0;
        $this->name        = $data['name']        ?? '';
        $this->description = $data['description'] ?? '';
        $this->price       = $data['price'] ?? 0;
        $this->rating      = $data['rating']  ?? 0;
        $this->image       = $data['image']       ?? '';
    }

    public function toArray(): array {
        return [
            'id'          => $this->id,
            'category_id' => $this->categoryId,
            'name'        => $this->name,
            'description' => $this->description,
            'price'       => $this->price,
            'rating'      => $this->rating,
            'image'       => $this->image,
        ];
    }
}
