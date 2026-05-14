<?php
// Sprint 1 - user model
class User
{
    public int $id;
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
    public bool $active;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? 0;
        $this->salutation = $data['salutation'] ?? '';
        $this->firstname = $data['firstname']
            ?? $data['first_name']
            ?? '';
        $this->lastname = $data['lastname']
            ?? $data['last_name']
            ?? '';
        $this->address = $data['address'] ?? '';
        $this->zip = $data['zip'] ?? '';
        $this->city = $data['city'] ?? '';
        $this->email = $data['email'] ?? '';
        $this->username = $data['username'] ?? '';
        $this->password = $data['password'] ?? '';
        $this->role = $data['role'] ?? 'customer';
        $this->active = (bool) ($data['active'] ?? true);
    }

    // Checks an inserted password against the saved hash
    public function checkPassword(string $plainPassword): bool
    {
        return password_verify($plainPassword, $this->password);
    }

    // Safe export, never expose password
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'salutation' => $this->salutation,
            'firstname' => $this->firstname,
            'lastname' => $this->lastname,
            'address' => $this->address,
            'zip' => $this->zip,
            'city' => $this->city,
            'email' => $this->email,
            'username' => $this->username,
            'role' => $this->role,
            'active' => $this->active,
        ];
    }
}
