```php
<?php

/**
 * Central request dispatcher
 * Initializes all business logic handlers and routes incoming requests to the selected handler.
 */

// Enable error reporting during development.
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/userHandler.php';
require_once __DIR__ . '/productHandler.php';
require_once __DIR__ . '/orderHandler.php';
require_once __DIR__ . '/cartHandler.php';
require_once __DIR__ . '/paymentHandler.php';
require_once __DIR__ . '/voucherHandler.php';
require_once __DIR__ . '/adminHandler.php';

require_once __DIR__ . '/../db/orderDataHandler.php';
require_once __DIR__ . '/../db/adminDataHandler.php';

/**
 * RequestHandler
 *
 * Creates all required handler instances and dispatches requests based on the handler and method parameters.
 */
class RequestHandler
{
    private const HTTP_NOT_FOUND = 404;

    private UserHandler $userHandler;
    private ProductHandler $productHandler;
    private OrderHandler $orderHandler;
    private CartHandler $cartHandler;
    private PaymentHandler $paymentHandler;
    private VoucherHandler $voucherHandler;
    private AdminHandler $adminHandler;

    /**
     * Initializes all business logic handlers with their required data access dependencies.
     *
     * @param DBaccess $db Shared database connection wrapper
     */
    public function __construct(DBaccess $db)
    {
        $this->userHandler = new UserHandler(
            new UserDataHandler($db),
            new CartDataHandler($db),
            new PaymentDataHandler($db)
        );

        $this->productHandler = new ProductHandler(
            new ProductDataHandler($db)
        );

        $this->orderHandler = new OrderHandler(
            new OrderDataHandler($db),
            new ProductDataHandler($db),
            new VoucherDataHandler($db)
        );

        $this->cartHandler = new CartHandler(
            new CartDataHandler($db),
            new ProductDataHandler($db)
        );

        $this->paymentHandler = new PaymentHandler(
            new PaymentDataHandler($db)
        );

        $this->voucherHandler = new VoucherHandler(
            new VoucherDataHandler($db),
            new ProductDataHandler($db)
        );

        $this->adminHandler = new AdminHandler(
            new AdminDataHandler($db)
        );
    }

    /**
     * Dispatches the request to the selected domain handler.
     *
     * @param string $handler Handler name from the request (users, products, orders, cart, payment, vouchers, admin)
     * @param string $method Method name passed to the selected handler
     * @param array $data Request data passed to the selected handler method
     * @return array Operation result or error details
     */
    public function dispatch(
        string $handler,
        string $method,
        array $data = []
    ): array {
        return match ($handler) {
            'users' => $this->userHandler->handle($method, $data),
            'products' => $this->productHandler->handle($method, $data),
            'orders' => $this->orderHandler->handle($method, $data),
            'cart' => $this->cartHandler->handle($method, $data),
            'payment' => $this->paymentHandler->handle($method, $data),
            'vouchers' => $this->voucherHandler->handle($method, $data),
            'admin' => $this->adminHandler->handle($method, $data),

            default => $this->unknownHandler($handler),
        };
    }

    /**
     * Handles requests for unknown handler names.
     *
     * @param string $handler Unknown handler name from the request
     * @return array Error response
     */
    private function unknownHandler(string $handler): array
    {
        http_response_code(self::HTTP_NOT_FOUND);

        return [
            'code' => self::HTTP_NOT_FOUND,
            'success' => false,
            'error' => "Unknown handler '$handler'"
        ];
    }
}