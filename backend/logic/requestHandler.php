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

class RequestHandler {
    private DataHandler    $dh;
    private UserHandler    $userHandler;
    private ProductHandler $productHandler;
    private OrderHandler   $orderHandler;
    private CouponHandler  $couponHandler;
    private AdminHandler   $adminHandler;
    private CartHandler   $cartHandler;

    public function __construct(DataHandler $dh) {
        $this->dh             = $dh;
        $this->userHandler    = new UserHandler($dh);
        $this->productHandler = new ProductHandler($dh);
        $this->orderHandler   = new OrderHandler($dh);
        $this->couponHandler  = new CouponHandler($dh);
        $this->adminHandler   = new AdminHandler($dh);
        $this->cartHandler    = new CartHandler($dh);
    }

    public function dispatch(string $handler, string $method): ?array {
        return match($handler) {
            'users'    => $this->userHandler->handle($method),
            'products' => $this->productHandler->handle($method),
            'orders'   => $this->orderHandler->handle($method),
            'coupons'  => $this->couponHandler->handle($method),
            'admin'    => $this->adminHandler->handle($method),
            'cart'     => $this->cartHandler->handle($method),
            default    => null,
        };
    }
}
?>