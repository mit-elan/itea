<?php

require_once __DIR__ . '/../models/cart.class.php';

class CartHandler
{
    private DataHandler $dh;
    public function __construct(DataHandler $dh)
    {
        $this->dh = $dh;
    }

    public function handle(string $method, array $data = [])
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

        $cartItem = new Cart([
            'userId'    => $_SESSION['user_id'] ?? 0,
            'productId' => $productId,
            'quantity'  => $quantity,
        ]);

        $_SESSION['cart'][$cartItem->product_id] = ($_SESSION['cart'][$cartItem->product_id] ?? 0) + $cartItem->quantity;

        return [
            'success'   => true,
            'cartCount' => array_sum($_SESSION['cart'])
        ];
    }

    private function updateCart(): array
    {
        $productId = (int)($_POST['productId'] ?? 0);
        $quantity  = (int)($_POST['quantity']  ?? 0);

        if (!$productId || !$quantity) {
            return ['success' => false, 'error' => 'Missing parameters'];
        }

        $cartItem = new Cart([
            'userId'    => $_SESSION['user_id'] ?? 0,
            'productId' => $productId,
            'quantity'  => $quantity,
        ]);

        $_SESSION['cart'][$cartItem->product_id] = $cartItem->quantity;

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
            if (!$product) continue;

            $cartItem = new Cart([
                'userId'    => $_SESSION['user_id'] ?? 0,
                'productId' => (int)$productId,
                'quantity'  => $quantity,
            ]);

            $cartItems[] = [
                'id'        => $product['id'],
                'file_path' => $product['file_path'],
                'name'      => $product['name'],
                'price'     => $product['price'],
                'quantity'  => $cartItem->quantity,
            ];
        }

        return ['success' => true, 'cartItems' => $cartItems];
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
