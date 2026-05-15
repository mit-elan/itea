<?php

require_once __DIR__ . '/../models/payment.class.php';

class paymentHandler
{
    private DataHandler $dh;

    public function __construct(DataHandler $dh)
    {
        $this->dh = $dh;
    }

    public function handle(string $method, array $data = [])
    {
        return match ($method) {
            'getByUserId' => $this->getByUserId(),
            default       => null,
        };
    }

    private function getByUserId(): array
    {
        if (!isLoggedIn()) {
            http_response_code(401);
            return ['error' => 'Unauthorized'];
        }

        $userId = $_SESSION['user_id'];
        $rows = $this->dh->getPaymentMethodsByUserId($userId);

        return ['paymentMethods' => $rows];
    }
}
    