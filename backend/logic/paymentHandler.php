<?php

require_once __DIR__ . '/../models/payment.class.php';

class PaymentHandler
{
    private DataHandler $dh;

    public function __construct(DataHandler $dh)
    {
        $this->dh = $dh;
    }

    public function handle(
        string $method,
        array $data = []
    ) {
        return match ($method) {

            'getByUserId' => $this->getByUserId(),
            'getPaymentMethods' => $this->getByUserId(),
            'createPaymentMethod' => $this->createPaymentMethod(),
            'deletePaymentMethod' => $this->deletePaymentMethod(),

            default => null,
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

    private function createPaymentMethod(): array
    {
        if (!isLoggedIn()) {

            http_response_code(401);

            return [
                'success' => false,
                'error' => 'Unauthorized'
            ];
        }

        $userId = $_SESSION['user_id'];

        $success = $this->dh->createPaymentMethod(
            $userId,
            $_POST
        );

        if (!$success) {

            return [
                'success' => false,
                'error' => 'Failed to save payment method'
            ];
        }

        return [
            'success' => true
        ];
    }

    private function deletePaymentMethod(): array
    {
        if (!isLoggedIn()) {

            return [
                'success' => false,
                'error' => 'Unauthorized'
            ];
        }

        $paymentId = intval($_POST['paymentId'] ?? 0);

        $success = $this->dh->deletePaymentMethod(
            $paymentId,
            $_SESSION['user_id']
        );

        return [
            'success' => $success
        ];
    }
}
