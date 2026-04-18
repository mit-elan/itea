<?php

/**
 * UserHandler
 * Sprint 1: Login, Registrierung
 * Sprint 2: Profil bearbeiten, Zahlungsmethoden
 */
class UserHandler
{
    private DataHandler $dh;
    public function __construct(DataHandler $dh)
    {
        $this->dh = $dh;
    }

    public function handle(string $method)
    {
        return match ($method) {

            // Sprint 1
            // 'login'    => $this->login(),
            'register' => $this->register(),
            // 'logout'   => $this->logout(),
            // Sprint 2
            // 'getProfile'       => $this->getProfile(),
            // 'updateProfile'    => $this->updateProfile(),
            // 'addPaymentMethod' => $this->addPaymentMethod(),
            default => null,
        };
    }

    private function register()
    {
        foreach (['salutation', 'firstname', 'lastname', 'address', 'zip', 'city', 'email', 'username', 'password'] as $field) {
            if (empty($_POST[$field])) {
                return ['error' => "Field '$field' is required"];
            }
        }

        $success = $this->dh->createUser($_POST);
        if ($success === false) {
            return ['error' => 'Registration failed due to a database error'];
        } elseif ($success === "doubleEntry") {
            return ['error' => 'Username or Email already taken'];
        } else if ($success === true) {
            return ['message' => 'Registration successful'];
        }
    }
}
