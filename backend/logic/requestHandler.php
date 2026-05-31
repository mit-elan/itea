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
require_once __DIR__ . '/cartHandler.php';
require_once __DIR__ . '/paymentHandler.php';
require_once __DIR__ . '/voucherHandler.php';
require_once __DIR__ . '/adminHandler.php';

require_once __DIR__ . '/../db/orderDataHandler.php';
require_once __DIR__ . '/../db/adminDataHandler.php';

class RequestHandler
{
    private UserHandler $userHandler;
    private ProductHandler $productHandler;
    private OrderHandler $orderHandler;
    private CartHandler $cartHandler;
    private PaymentHandler $paymentHandler;
    private VoucherHandler $voucherHandler;
    private AdminHandler $adminHandler;


    public function __construct(DBaccess $db)
    {
        $this->userHandler    = new UserHandler(new DataHandler($db), new CartDataHandler($db), new PaymentDataHandler($db));
        $this->productHandler = new ProductHandler(new ProductDataHandler($db));
        $this->orderHandler   = new OrderHandler(new OrderDataHandler($db), new ProductDataHandler($db), new VoucherDataHandler($db));
        $this->cartHandler    = new CartHandler(new CartDataHandler($db), new ProductDataHandler($db));
        $this->paymentHandler = new PaymentHandler(new PaymentDataHandler($db));
        $this->voucherHandler  = new VoucherHandler(new VoucherDataHandler($db), new ProductDataHandler($db));
        $this->adminHandler   = new AdminHandler(new AdminDataHandler($db));
    }

    public function dispatch(
        string $handler,
        string $method,
        array $data = []
    ): ?array {
        return match ($handler) {
            'users'    => $this->userHandler->handle($method, $data),
            'products' => $this->productHandler->handle($method, $data),
            'orders'   => $this->orderHandler->handle($method, $data),
            'cart'     => $this->cartHandler->handle($method, $data),
            'payment'  => $this->paymentHandler->handle($method, $data),
            'vouchers' => $this->voucherHandler->handle($method, $data),
            'admin'    => $this->adminHandler->handle($method, $data),
            default    => null,
        };
    }
}
