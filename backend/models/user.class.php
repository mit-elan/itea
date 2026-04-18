<?php
/** Sprint 1 – User Model */
class User {
    public int    $id;
    public string $salutation;
    public string $firstname;
    public string $lastname;
    public string $address;
    public string $zip;
    public string $city;
    public string $email;
    public string $username;
    public string $password;   // always hashed
    public string $role;       // 'customer' | 'admin'
    public bool   $active;

    public function __construct(array $data) {
        $this->id         = $data['id']         ?? 0;
        $this->salutation = $data['salutation'] ?? '';
        $this->firstname  = $data['firstname']  ?? '';
        $this->lastname   = $data['lastname']   ?? '';
        $this->address    = $data['address']    ?? '';
        $this->zip        = $data['zip']        ?? '';
        $this->city       = $data['city']       ?? '';
        $this->email      = $data['email']      ?? '';
        $this->username   = $data['username']   ?? '';
        $this->password   = $data['password']   ?? '';
        $this->role       = $data['role']       ?? 'customer';
        $this->active     = $data['active'] ?? true;
    }

    /** Safe export – never expose password */
    public function toArray(): array {
        return [
            'id'        => $this->id,
            'firstname' => $this->firstname,
            'lastname'  => $this->lastname,
            'email'     => $this->email,
            'username'  => $this->username,
            'role'      => $this->role,
            'active'    => $this->active,
        ];
    }
}
