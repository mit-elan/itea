<?php

require_once __DIR__ . '/../models/cart.class.php';

class CartHandler
{
    private CartDataHandler $cartDataHandler;
    private ProductDataHandler $productDataHandler;

    public function __construct(CartDataHandler $cartDataHandler, ProductDataHandler $productDataHandler)
    {
        $this->cartDataHandler = $cartDataHandler;
        $this->productDataHandler = $productDataHandler;
    }

    public function handle(string $method, array $data = []): ?array
    {
        return match ($method) {
            'addToCart'      => $this->addToCart($data),
            'loadCart'       => $this->loadCart(),
            'removeFromCart' => $this->removeFromCart($data),
            'updateCart'     => $this->updateCart($data),
            default          => null,
        };
    }

    private function addToCart(array $data): array
    {
        $productId = (int)($data['productId'] ?? 0);
        $quantity  = (int)($data['quantity']  ?? 0);

        if (!$productId || !$quantity) {
            return ['code' => 400, 'error' => 'Missing parameters'];
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

        return ['cartCount' => array_sum($_SESSION['cart'])];
    }

    private function updateCart(array $data): array
    {
        $productId = (int)($data['productId'] ?? 0);
        $quantity  = (int)($data['quantity']  ?? 0);

        if (!$productId || !$quantity) {
            return ['code' => 400, 'error' => 'Missing parameters'];
        }

        $cartItem = new Cart([
            'userId'    => $_SESSION['user_id'] ?? 0,
            'productId' => $productId,
            'quantity'  => $quantity,
        ]);

        $_SESSION['cart'][$cartItem->product_id] = $cartItem->quantity;

        return ['cartCount' => array_sum($_SESSION['cart'])];
    }

    private function loadCart(): array
    {
        $cart = $_SESSION['cart'] ?? [];

        if (empty($cart)) {
            return ['cartItems' => []];
        }

        $cartItems = [];
        foreach ($cart as $productId => $quantity) {
            $product = $this->productDataHandler->getProductById((int)$productId);
            if (!$product) continue;

            $cartItems[] = [
                'id'        => $product->id,
                'file_path' => $product->filePath,
                'name'      => $product->name,
                'price'     => $product->price,
                'quantity'  => $quantity,
            ];
        }

        return ['cartItems' => $cartItems];
    }

    private function removeFromCart(array $data): array
    {
        $productId = (int)($data['productId'] ?? 0);

        if (!$productId) {
            return ['code' => 400, 'error' => 'Missing parameters'];
        }

        unset($_SESSION['cart'][$productId]);

        return ['cartCount' => array_sum($_SESSION['cart'] ?? [])];
    }
}
