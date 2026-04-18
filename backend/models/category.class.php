<?php
/** Sprint 1 – Category Model */
class Category {
    public int    $id;
    public string $name;

    public function __construct(array $data) {
        $this->id   = $data['id']   ?? 0;
        $this->name = $data['name'] ?? '';
    }

    public function toArray(): array {
        return ['id' => $this->id, 'name' => $this->name];
    }
}
