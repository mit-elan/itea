<?php
/** Sprint 1 – Category Model */
class Category {
    public int    $id;
    public string $name;

    //man braucht in php eigentlich keinen konstruktor get und set brauche ich nur wenn ich was veränder buem rienschreib oder auslesen 
    public function __construct(array $data) {
        $this->id   = $data['id']   ?? 0;
        $this->name = $data['name'] ?? '';
    }

    public function toArray(): array {
        return ['id' => $this->id, 'name' => $this->name];
    }
}
