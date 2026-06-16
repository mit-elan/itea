<?php

require_once __DIR__ . '/../models/cart.class.php';

/**
 * Business logic handler for cart operations
 * Routes requests to session-based cart creation, loading, updating, and removal methods
 */
class CartHandler
{
    private const HTTP_BAD_REQUEST = 400;
    private const HTTP_NOT_FOUND = 404;

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
     * @return array Operation result or error details
     */
    public function handle(string $method, array $data = []): array
    {
        return match ($method) {
            'addToCart' => $this->addToCart($data),
            'loadCart' => $this->loadCart(),
            'removeFromCart' => $this->removeFromCart($data),
            'updateCart' => $this->updateCart($data),

            default => $this->errorResponse(
                self::HTTP_NOT_FOUND,
                'Unknown cart method'
            ),
        };
    }

    /**
     * Creates a standardized error response and sets the matching HTTP status code
     *
     * @param int $code HTTP status code
     * @param string $message Error message for the API response
     * @return array Error response
     */
    private function errorResponse(int $code, string $message): array
    {
        http_response_code($code);

        return [
            'code' => $code,
            'error' => $message
        ];
    }

    /**
     * Adds product to session cart, accumulating quantity if product already exists
     *
     * @param array $data Must contain productId and quantity
     * @return array Response with cartCount on success or error details
     */
    private function addToCart(array $data): array
    {
        $productId = (int)($data['productId'] ?? 0);
        $quantity = (int)($data['quantity'] ?? 0);

        // Validate product ID and quantity
        if ($productId <= 0 || $quantity <= 0) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Missing or invalid cart parameters'
            );
        }

        // Ensure the session cart exists before adding items
        if (!isset($_SESSION['cart'])) {
            $_SESSION['cart'] = [];
        }

        $cartItem = new Cart([
            'userId' => $_SESSION['user_id'] ?? 0,
            'productId' => $productId,
            'quantity' => $quantity,
        ]);

        // Accumulate quantity: adding the same product twice increases the total quantity
        $_SESSION['cart'][$cartItem->product_id] =
            ($_SESSION['cart'][$cartItem->product_id] ?? 0) + $cartItem->quantity;

        return [
            'cartCount' => array_sum($_SESSION['cart'])
        ];
    }

    /**
     * Replaces product quantity in session cart
     * Unlike addToCart, this sets the absolute quantity instead of accumulating
     *
     * @param array $data Must contain productId and quantity
     * @return array Response with cartCount on success or error details
     */
    private function updateCart(array $data): array
    {
        $productId = (int)($data['productId'] ?? 0);
        $quantity = (int)($data['quantity'] ?? 0);

        // Validate product ID and quantity
        if ($productId <= 0 || $quantity <= 0) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Missing or invalid cart parameters'
            );
        }

        // Ensure the session cart exists before updating items
        if (!isset($_SESSION['cart'])) {
            $_SESSION['cart'] = [];
        }

        $cartItem = new Cart([
            'userId' => $_SESSION['user_id'] ?? 0,
            'productId' => $productId,
            'quantity' => $quantity,
        ]);

        // Direct replacement: set quantity to exact value selected by the user
        $_SESSION['cart'][$cartItem->product_id] = $cartItem->quantity;

        return [
            'cartCount' => array_sum($_SESSION['cart'])
        ];
    }

    /**
     * Loads cart from session and enriches it with current product data
     *
     * @return array Response with cartItems array containing full product details and quantities
     */
    private function loadCart(): array
    {
        $cart = $_SESSION['cart'] ?? [];

        if (empty($cart)) {
            return [
                'cartItems' => []
            ];
        }

        // Enrich session cart with current product data such as price, name, and file path
        $cartItems = [];

        foreach ($cart as $productId => $quantity) {
            $product = $this->productDataHandler->getProductById((int)$productId);

            // Silently skip products that no longer exist
            if (!$product) {
                continue;
            }

            $cartItems[] = [
                'id' => $product->id,
                'file_path' => $product->filePath,
                'name' => $product->name,
                'price' => $product->price,
                'quantity' => $quantity,
            ];
        }

        return [
            'cartItems' => $cartItems
        ];
    }

    /**
     * Removes product from session cart
     *
     * @param array $data Must contain productId
     * @return array Response with cartCount on success or error details
     */
    private function removeFromCart(array $data): array
    {
        $productId = (int)($data['productId'] ?? 0);

        // Validate product ID
        if ($productId <= 0) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Missing or invalid product id'
            );
        }

        unset($_SESSION['cart'][$productId]);

        return [
            'cartCount' => array_sum($_SESSION['cart'] ?? [])
        ];
    }
}