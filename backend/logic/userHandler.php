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
            'login'    => $this->login(),
            'register' => $this->register(),
            'logout'   => $this->logout(),
            'status' => $this->status(),

            // Sprint 2
            // 'getProfile'       => $this->getProfile(),
            // 'updateProfile'    => $this->updateProfile(),
            // 'addPaymentMethod' => $this->addPaymentMethod(),

            default => null,
        };
    }
    //Login
    private function login()
    {
        foreach (['identifier', 'password'] as $field) {
            if (empty($_POST[$field])) {
                return ['error' => "Field '$field' is required"];
            }
        }

        $identifier = trim($_POST['identifier']);
        $password = $_POST['password'];

        // User kann sich mit username oder email einloggen
        $user = $this->dh->getUserByIdentifier($identifier);

        if (!$user) {
            return ['error' => 'Invalid username/email or password'];
        }

        // Inaktive User dürfen sich nicht einloggen
        if ((int)$user['active'] !== 1) {
            return ['error' => 'This account is inactive'];
        }

        // Passwort gegen den gespeicherten Hash prüfen
        if (!password_verify($password, $user['password'])) {
            return ['error' => 'Invalid username/email or password'];
        }

        // Session Werte für eingeloggten User setzen
        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];

        return [
            'message' => 'Login successful',
            'userId' => (int)$user['id'],
            'username' => $user['username'],
            'role' => $user['role'],
        ];
    }

    //Logout
    private function logout()
    {
        //Session Daten löschen
        $_SESSION = [];

        // Session Cookie entfernen falls vorhanden
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();

            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }

        session_destroy();

        return ['message' => 'Logout successful'];
    }

    //Register
    private function register()
    {
        foreach (['salutation', 'firstname', 'lastname', 'address', 'zip', 'city', 'email', 'username', 'password'] as $field) {
            if (empty($_POST[$field])) {
                return ['error' => "Field '$field' is required"];
            }
        }

        $message = $this->dh->createUser($_POST);

        if ($message === true) {
            return ['message' => 'Registration successful'];
        } elseif ($message === "doubleEntry") {
            return ['error' => 'Email or username already taken!'];
        } else {
            return ['error' => 'Registration failed due to a database error'];
        }
    }

    private function status()
    {
        if (!isset($_SESSION['user_id'])) {
            return [
                'loggedIn' => false,
                'role' => 'guest'
            ];
        }
        $cartCount = $this->dh->getCartCount($_SESSION['user_id']);
        return [
            'loggedIn' => true,
            'userId' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'role' => $_SESSION['role'],
            'cartCount' => $cartCount
        ];
    }
}
