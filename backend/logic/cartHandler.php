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
            'addToCart'         => $this->addToCart(),
            'loadCart'          => $this->loadCart(),
            default             => null,
        };
    }

    private function addToCart(): array
    {
        $userId    = $_POST['userId']    ?? null;
        $productId = $_POST['productId'] ?? null;
        $quantity  = $_POST['quantity']  ?? null;

        if (!$userId) {
            return [
                'success' => false,
                'error' => 'Missing User'
            ];
        } else if (!$productId || !$quantity) {
            return [
                'success' => false,
                'error' => 'Missing parameters'
            ];
        }

        return $this->dh->updateCart($userId, $productId, $quantity);
    }

    private function loadCart(): array
    {
        $userId = $_GET['userId'] ?? null;
        if (!$userId) {
            return ['success' => false, 'error' => 'Missing User'];
        }
        return [
            'success'   => true,
            'cartItems' => $this->dh->getCart($userId)
        ];
    }
}
