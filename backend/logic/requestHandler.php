<?php
/**
 * Zentraler Request-Dispatcher.
 * Leitet Anfragen an die jeweiligen Handler-Klassen weiter.
 */

// 1. Fehler-Reporting aktivieren
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/userHandler.php';
require_once __DIR__ . '/productHandler.php';
require_once __DIR__ . '/orderHandler.php';
require_once __DIR__ . '/couponHandler.php';
require_once __DIR__ . '/adminHandler.php';
require_once __DIR__ . '/cartHandler.php';
require_once __DIR__ . '/paymentHandler.php';

require_once __DIR__ . '/../config/orderDataHandler.php';

class RequestHandler
{
    private DataHandler $dh;
    private OrderDataHandler $odh;
    private UserHandler $userHandler;
    private ProductHandler $productHandler;
    private OrderHandler $orderHandler;
    private CouponHandler $couponHandler;
    private AdminHandler $adminHandler;
    private CartHandler $cartHandler;
    private PaymentHandler $paymentHandler;

    // In Zukunft muss noch pro Handler ein eigener DataHandler mitgegeben werden
    public function __construct(DataHandler $dh)
    {
        $this->dh = $dh;
        $this->userHandler = new UserHandler($dh);
        $this->productHandler = new ProductHandler($dh);
        $this->odh = new OrderDataHandler();
        $this->orderHandler = new OrderHandler(
            $this->odh,
            $this->dh);
        $this->couponHandler = new CouponHandler($dh);
        $this->adminHandler = new AdminHandler($dh);
     // $this->cartHandler = new CartHandler(new CartDataHandler($db));
        $this->cartHandler = new CartHandler($dh);
        $this->paymentHandler = new PaymentHandler($dh);
    }

    public function dispatch(
        string $handler,
        string $method,
        array $data = []
    ): ?array {
        return match ($handler) {
            'users' => $this->userHandler->handle($method, $data),
            'products' => $this->productHandler->handle($method, $data),
            'orders' => $this->orderHandler->handle($method),
            'coupons' => $this->couponHandler->handle($method, $data),
            'admin' => $this->adminHandler->handle($method, $data),
            'cart' => $this->cartHandler->handle($method, $data),
            'payment' => $this->paymentHandler->handle($method, $data),
            default => null,
        };
    }
}
?>