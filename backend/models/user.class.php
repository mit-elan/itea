<?php

/**
 * Represents a user account.
 * Stores authentication, profile, role, and account status data.
 */
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
    public string $password;
    public string $role;
    public bool $active;

    /**
     * Creates a user from database or request data.
     * Supports both firstname/lastname and first_name/last_name keys.
     *
     * @param array $data User data with optional profile, login, role, and status fields
     */
    public function __construct(array $data)
    {
        $this->id = (int)($data['id'] ?? 0);
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
        $this->active = (bool)($data['active'] ?? true);
    }

    /**
     * Checks a plain text password against the stored password hash.
     *
     * @param string $plainPassword Password entered by the user
     * @return bool True if the password matches the stored hash
     */
    public function checkPassword(string $plainPassword): bool
    {
        return password_verify($plainPassword, $this->password);
    }

    /**
     * Converts the user object into an array for API responses.
     * The password hash is intentionally excluded.
     *
     * @return array Safe user data for frontend usage
     */
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