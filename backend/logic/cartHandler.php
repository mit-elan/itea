<?php

/**
 * ProductHandler
 * Sprint 1: Produkte listen, Kategorien, Suche
 */
class CartHandler
{
    private DataHandler $dh;
    public function __construct(DataHandler $dh)
    {
        $this->dh = $dh;
    }

    public function handle(string $method)
    {
        return match ($method) {
            'addToCart'      => $this->addToCart(),
            'loadCart'       => $this->loadCart(),
            'removeFromCart' => $this->removeFromCart(),
            'updateCart'     => $this->updateCart(), // addToCart und updateCart können dieselbe Logik verwenden
            default          => null,
        };
    }

    private function addToCart(): array
    {
        $productId = (int)($_POST['productId'] ?? 0);
        $quantity  = (int)($_POST['quantity']  ?? 0);

        if (!$productId || !$quantity) {
            return ['success' => false, 'error' => 'Missing parameters'];
        }

        if (!isset($_SESSION['cart'])) {
            $_SESSION['cart'] = [];
        }

        $_SESSION['cart'][$productId] = ($_SESSION['cart'][$productId] ?? 0) + $quantity;

        return [
            'success'   => true,
            'cartCount' => array_sum($_SESSION['cart'])
        ];

        // OLD DB-based implementation (Sprint 2):
        // $userId    = $_POST['userId'];
        // $productId = $_POST['productId'];
        // $quantity  = $_POST['quantity'];
        // if (!$userId) {
        //     return ['success' => false, 'error' => 'Missing User'];
        // } else if (!$productId || !$quantity) {
        //     return ['success' => false, 'error' => 'Missing parameters'];
        // }
        // return $this->dh->updateCart($userId, $productId, $quantity);
    }

    private function updateCart(): array
    {
        //Error Handling? zB Negative Zahl und nicht-Integer
        $productId = (int)($_POST['productId'] ?? 0);
        $quantity  = (int)($_POST['quantity']  ?? 0);

        if (!$productId || !$quantity) {
            return ['success' => false, 'error' => 'Missing parameters'];
        }

        $_SESSION['cart'][$productId] = $quantity;

        return [
            'success'   => true,
            'cartCount' => array_sum($_SESSION['cart'])
        ];
    }

    private function loadCart(): array
    {
        $cart = $_SESSION['cart'] ?? [];

        if (empty($cart)) {
            return ['success' => true, 'cartItems' => []];
        }

        $cartItems = [];
        foreach ($cart as $productId => $quantity) {
            $product = $this->dh->getProductById((int)$productId);
            if ($product) {
                $cartItems[] = [
                    'id'        => $product['id'],
                    'file_path' => $product['file_path'],
                    'name'      => $product['name'],
                    'price'     => $product['price'],
                    'quantity'  => $quantity,
                ];
            }
        }

        return ['success' => true, 'cartItems' => $cartItems];

        // OLD DB-based implementation (Sprint 2):
        // $userId = $_GET['userId'];
        // if (!$userId) {
        //     return ['success' => false, 'error' => 'Missing User'];
        // }
        // return [
        //     'success'   => true,
        //     'cartItems' => $this->dh->getCart($userId)
        // ];
    }

    private function removeFromCart(): array
    {
        $productId = (int)($_POST['productId'] ?? 0);

        if (!$productId) {
            return ['success' => false, 'error' => 'Missing parameters'];
        }

        unset($_SESSION['cart'][$productId]);

        return [
            'success'   => true,
            'cartCount' => array_sum($_SESSION['cart'] ?? [])
        ];
    }
}
