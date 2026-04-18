<?php
/**
 * Zentraler Request-Dispatcher.
 * Leitet Anfragen an die jeweiligen Handler-Klassen weiter.
 */
require_once __DIR__ . '/userHandler.php';
require_once __DIR__ . '/productHandler.php';
require_once __DIR__ . '/orderHandler.php';
require_once __DIR__ . '/couponHandler.php';
require_once __DIR__ . '/adminHandler.php';

class RequestHandler {
    private DataHandler    $dh;
    private UserHandler    $userHandler;
    private ProductHandler $productHandler;
    private OrderHandler   $orderHandler;
    private CouponHandler  $couponHandler;
    private AdminHandler   $adminHandler;

    public function __construct(DataHandler $dh) {
        $this->dh             = $dh;
        $this->userHandler    = new UserHandler($dh);
        $this->productHandler = new ProductHandler($dh);
        $this->orderHandler   = new OrderHandler($dh);
        $this->couponHandler  = new CouponHandler($dh);
        $this->adminHandler   = new AdminHandler($dh);
    }

    public function dispatch(string $handler, string $method): ?array {
        return match($handler) {
            'users'    => $this->userHandler->handle($method),
            'products' => $this->productHandler->handle($method),
            'orders'   => $this->orderHandler->handle($method),
            'coupons'  => $this->couponHandler->handle($method),
            'admin'    => $this->adminHandler->handle($method),
            default    => null,
        };
    }
}
