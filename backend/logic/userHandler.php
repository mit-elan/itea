<?php

require_once __DIR__ . '/../models/user.class.php';
require_once __DIR__ . '/../models/cart.class.php';

/**
 * UserHandler
 * Sprint 1: Login, Registrierung
 * Sprint 2: Profil bearbeiten, Zahlungsmethoden
 * 
 **/
class UserHandler
{
    private DataHandler $dh;
    private CartDataHandler $cartDataHandler;
    private PaymentDataHandler $paymentDataHandler;

    public function __construct(DataHandler $dh, CartDataHandler $cartDataHandler, PaymentDataHandler $paymentDataHandler)
    {
        $this->dh                   = $dh;
        $this->cartDataHandler      = $cartDataHandler;
        $this->paymentDataHandler    = $paymentDataHandler;
    }


    public function handle(string $method, array $data = [])
    {
        return match ($method) {

            // Sprint 1
            'login' => $this->login(),
            'register' => $this->register(),
            'logout' => $this->logout(),
            'status' => $this->status(),

            // Sprint 2
            'getProfile' => $this->getProfile(),
            'updateProfile' => $this->updateProfile(),
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
        $userData = $this->dh->getUserByIdentifier($identifier);

        if (!$userData) {
            return ['error' => 'Invalid username/email or password'];
        }

        // Aus den DB-Daten wird ein User Model erstellt
        $user = new User($userData);

        // Inaktive User dürfen sich nicht einloggen
        if (!$user->active) {
            return ['error' => 'This account is inactive'];
        }

        // Passwort gegen den gespeicherten Hash prüfen
        if (!$user->checkPassword($password)) {
            return ['error' => 'Invalid username/email or password'];
        }

        // Session Werte für eingeloggten User setzen
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user->id;
        $_SESSION['username'] = $user->username;
        $_SESSION['role'] = $user->role;

        // Gast-Cart sichern, DB-Cart laden und mergen
        $guestCart = $_SESSION['cart'] ?? [];

        $dbCart = [];
        foreach ($this->cartDataHandler->loadCartFromDb($user->id) as $item) {
            $dbCart[$item->product_id] = $item->quantity;
        }

        // Gast-Items addieren (Gast-Menge hat Vorrang bei Überschneidung)
        foreach ($guestCart as $productId => $quantity) {
            $dbCart[$productId] = ($dbCart[$productId] ?? 0) + $quantity;
        }

        $_SESSION['cart'] = $dbCart;

        return [
            'message' => 'Login successful',
            'userId' => $user->id,
            'username' => $user->username,
            'role' => $user->role,
        ];
    }

    //Logout
    private function logout()
    {
        // Cart in DB persistieren bevor die Session gelöscht wird
        if (isset($_SESSION['user_id']) && !empty($_SESSION['cart'])) {
            $userId    = (int)$_SESSION['user_id'];
            $cartItems = [];
            foreach ($_SESSION['cart'] as $productId => $quantity) {
                $cartItems[] = new Cart([
                    'userId'    => $userId,
                    'productId' => (int)$productId,
                    'quantity'  => $quantity,
                ]);
            }
            $this->cartDataHandler->saveCartToDb($userId, $cartItems);
        }

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

        foreach (['paymentName', 'paymentType', 'cardNumber'] as $field) {
            if (!isset($_POST[$field]) || $_POST[$field] === '') {
                return ['error' => "Field '$field' is required"];
            }
        }

        $userId = $this->dh->createUser($_POST);

        if (is_int($userId)) {
            $this->paymentDataHandler->createPaymentMethod($userId, $_POST);
            return ['message' => 'Registration successful'];
        } elseif ($userId === "doubleEntry") {
            return ['error' => 'Email or username already taken!'];
        } else {
            return ['error' => 'Registration failed due to a database error'];
        }
    }

    private function status()
    {
        $cartCount = array_sum($_SESSION['cart'] ?? []);

        if (!isset($_SESSION['user_id'])) {
            return [
                'loggedIn'  => false,
                'role'      => 'guest',
                'cartCount' => $cartCount
            ];
        }

        return [
            'loggedIn'  => true,
            'userId'    => $_SESSION['user_id'],
            'username'  => $_SESSION['username'],
            'role'      => $_SESSION['role'],
            'cartCount' => $cartCount
        ];
    }


    private function getProfile()
    {
        if (!isset($_SESSION['user_id'])) {
            return [
                'error' => 'You must be logged in'
            ];
        }

        $userData = $this->dh->getUserById($_SESSION['user_id']);

        if (!$userData) {
            return [
                'error' => 'User not found'
            ];
        }

        $user = new User($userData);

        return $user->toArray();
    }

    private function updateProfile()
    {
        if (!isset($_SESSION['user_id'])) {
            return [
                'error' => 'You must be logged in'
            ];
        }

        $userData = $this->dh->getUserById(
            $_SESSION['user_id']
        );

        if (!$userData) {
            return [
                'error' => 'User not found'
            ];
        }

        $user = new User($userData);

        $password = $_POST['password'] ?? '';

        // Passwort bestätigen
        if (!$user->checkPassword($password)) {
            return [
                'error' => 'Incorrect password'
            ];
        }

        $success = $this->dh->updateUser(
            $_SESSION['user_id'],
            $_POST
        );

        if (!$success) {
            return [
                'error' => 'Failed to update profile'
            ];
        }

        return [
            'success' => true
        ];
    }
}
