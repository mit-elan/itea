<?php

require_once __DIR__ . '/../models/cart.class.php';

class CartHandler
{
    private CartDataHandler $cartDataHandler;
    private ProductDataHandler $productDataHandler;

    /**
     * @param CartDataHandler $cartDataHandler Data handler for cart persistence
     * @param ProductDataHandler $productDataHandler Data handler for product lookups
     */
    public function __construct(CartDataHandler $cartDataHandler, ProductDataHandler $productDataHandler)
    {
        $this->cartDataHandler = $cartDataHandler;
        $this->productDataHandler = $productDataHandler;
    }

    /**
     * Routes cart operations to appropriate handler methods
     *
     * @param string $method Operation name (addToCart, loadCart, removeFromCart, updateCart)
     * @param array $data Request parameters passed to the handler
     * @return array|null Operation result or null if method not recognized
     */
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

    /**
     * Adds product to session cart, accumulating quantity if product already exists
     *
     * @param array $data Must contain 'productId' and 'quantity' keys
     * @return array Response with cartCount (sum of all quantities) or error
     */
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

        // Accumulate quantity: adding same product twice increases total (e.g., 2 + 3 = 5)
        $_SESSION['cart'][$cartItem->product_id] = ($_SESSION['cart'][$cartItem->product_id] ?? 0) + $cartItem->quantity;

        return ['cartCount' => array_sum($_SESSION['cart'])];
    }

    /**
     * Replaces product quantity in session cart (used for cart page quantity changes)
     * Unlike addToCart, this sets absolute quantity, not accumulating
     *
     * @param array $data Must contain 'productId' and 'quantity' keys
     * @return array Response with cartCount (sum of all quantities) or error
     */
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

        // Direct replacement: setting quantity to exact value (e.g., user changed input to 5, set to 5)
        $_SESSION['cart'][$cartItem->product_id] = $cartItem->quantity;

        return ['cartCount' => array_sum($_SESSION['cart'])];
    }

    /**
     * Loads cart from session and enriches with current product data
     *
     * @return array Response with cartItems array containing full product details and quantities
     */
    private function loadCart(): array
    {
        $cart = $_SESSION['cart'] ?? [];

        if (empty($cart)) {
            return ['cartItems' => []];
        }

        // Enrich session cart with current product data (price, name, file path)
        $cartItems = [];
        foreach ($cart as $productId => $quantity) {
            $product = $this->productDataHandler->getProductById((int)$productId);
            // Silently skip products that no longer exist (e.g., deleted from database)
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

    /**
     * Removes product from session cart
     *
     * @param array $data Must contain 'productId' key
     * @return array Response with cartCount (sum of remaining quantities) or error
     */
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
