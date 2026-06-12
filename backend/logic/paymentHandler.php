<?php

require_once __DIR__ . '/../models/payment.class.php';
class PaymentHandler
{
    private PaymentDataHandler $paymentDataHandler;
    public function __construct(PaymentDataHandler $paymentDataHandler)
    {
        $this->paymentDataHandler = $paymentDataHandler;
    }

    public function handle( string $method, array $data = []) 
    {
        return match ($method) {

            'getByUserId' => $this->getByUserId(),
            'getPaymentMethods' => $this->getByUserId(),
            'createPaymentMethod' => $this->createPaymentMethod($data),
            'deletePaymentMethod' => $this->deletePaymentMethod($data),

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
        $rows = $this->paymentDataHandler->getPaymentMethodsByUserId($userId);

        return ['paymentMethods' => $rows];
    }

    private function createPaymentMethod(array $data): array
    {
        if (!isLoggedIn()) {

            http_response_code(401);

            return [
                'success' => false,
                'error' => 'Unauthorized'
            ];
        }

        $userId = $_SESSION['user_id'];

        $success = $this->paymentDataHandler->createPaymentMethod(
            $userId,
            $data
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

    private function deletePaymentMethod(array $data): array
    {
        if (!isLoggedIn()) {

            return [
                'success' => false,
                'error' => 'Unauthorized'
            ];
        }

        $paymentId = intval($data['paymentId'] ?? 0);

        $success = $this->paymentDataHandler->deletePaymentMethod(
            $paymentId,
            $_SESSION['user_id']
        );

        return [
            'success' => $success
        ];
    }
}
