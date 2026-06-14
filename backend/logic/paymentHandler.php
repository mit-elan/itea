<?php

require_once __DIR__ . '/../models/payment.class.php';

/**
 * Business logic handler for payment method operations
 * Routes requests to appropriate payment method retrieval, creation, and deletion methods
 */
class PaymentHandler
{
    private const HTTP_BAD_REQUEST = 400;
    private const HTTP_UNAUTHORIZED = 401;
    private const HTTP_INTERNAL_SERVER_ERROR = 500;

    private PaymentDataHandler $paymentDataHandler;

    /**
     * @param PaymentDataHandler $paymentDataHandler Data access handler for payment methods
     */
    public function __construct(PaymentDataHandler $paymentDataHandler)
    {
        $this->paymentDataHandler = $paymentDataHandler;
    }

    /**
     * Routes payment operations to appropriate handler methods
     *
     * @param string $method Operation name (getByUserId, getPaymentMethods, createPaymentMethod, deletePaymentMethod)
     * @param array $data Request data passed to handler methods
     * @return array Operation result or error details
     */
    public function handle(string $method, array $data = []): array
    {
        return match ($method) {
            'getByUserId' => $this->getByUserId(),
            'getPaymentMethods' => $this->getByUserId(),
            'createPaymentMethod' => $this->createPaymentMethod($data),
            'deletePaymentMethod' => $this->deletePaymentMethod($data),

            default => $this->unknownMethod(),
        };
    }

    /**
     * Retrieves all saved payment methods for the currently logged-in user
     *
     * @return array Response with payment methods on success or error details
     */
    private function getByUserId(): array
    {
        // User authentication check
        if (!isLoggedIn()) {
            http_response_code(self::HTTP_UNAUTHORIZED);

            return [
                'code' => self::HTTP_UNAUTHORIZED,
                'success' => false,
                'error' => 'Unauthorized'
            ];
        }

        // Load saved payment methods for the current user
        $userId = (int)$_SESSION['user_id'];
        $rows = $this->paymentDataHandler->getPaymentMethodsByUserId($userId);

        return [
            'success' => true,
            'paymentMethods' => $rows
        ];
    }

    /**
     * Creates a new payment method for the currently logged-in user
     *
     * @param array $data Payment method data including paymentType, cardNumber, paymentName
     * @return array Success response or error details
     */
    private function createPaymentMethod(array $data): array
    {
        // User authentication check
        if (!isLoggedIn()) {
            http_response_code(self::HTTP_UNAUTHORIZED);

            return [
                'code' => self::HTTP_UNAUTHORIZED,
                'success' => false,
                'error' => 'Unauthorized'
            ];
        }

        $paymentType = $data['paymentType'] ?? '';
        $cardNumber = trim($data['cardNumber'] ?? '');
        $paymentName = trim($data['paymentName'] ?? '');

        // Validate all required fields are present
        if ($paymentType === '' || $cardNumber === '' || $paymentName === '') {
            http_response_code(self::HTTP_BAD_REQUEST);

            return [
                'code' => self::HTTP_BAD_REQUEST,
                'success' => false,
                'error' => 'Missing payment method data'
            ];
        }

        // Validate payment type: 0 = credit card, 1 = bank account
        if ($paymentType !== '0' && $paymentType !== '1') {
            http_response_code(self::HTTP_BAD_REQUEST);

            return [
                'code' => self::HTTP_BAD_REQUEST,
                'success' => false,
                'error' => 'Invalid payment type'
            ];
        }

        // Save payment method for the current user
        $userId = (int)$_SESSION['user_id'];

        $success = $this->paymentDataHandler->createPaymentMethod(
            $userId,
            $data
        );

        if (!$success) {
            http_response_code(self::HTTP_INTERNAL_SERVER_ERROR);

            return [
                'code' => self::HTTP_INTERNAL_SERVER_ERROR,
                'success' => false,
                'error' => 'Failed to save payment method'
            ];
        }

        return [
            'success' => true
        ];
    }

    /**
     * Deletes a saved payment method of the currently logged-in user
     *
     * @param array $data Must contain paymentId
     * @return array Success response or error details
     */
    private function deletePaymentMethod(array $data): array
    {
        // User authentication check
        if (!isLoggedIn()) {
            http_response_code(self::HTTP_UNAUTHORIZED);

            return [
                'code' => self::HTTP_UNAUTHORIZED,
                'success' => false,
                'error' => 'Unauthorized'
            ];
        }

        $paymentId = (int)($data['paymentId'] ?? 0);

        // Validate payment method ID
        if ($paymentId <= 0) {
            http_response_code(self::HTTP_BAD_REQUEST);

            return [
                'code' => self::HTTP_BAD_REQUEST,
                'success' => false,
                'error' => 'Invalid payment method ID'
            ];
        }

        // Delete only if the payment method belongs to the current user
        $success = $this->paymentDataHandler->deletePaymentMethod(
            $paymentId,
            (int)$_SESSION['user_id']
        );

        if (!$success) {
            http_response_code(self::HTTP_INTERNAL_SERVER_ERROR);

            return [
                'code' => self::HTTP_INTERNAL_SERVER_ERROR,
                'success' => false,
                'error' => 'Failed to delete payment method'
            ];
        }

        return [
            'success' => true
        ];
    }

    /**
     * Handles unsupported payment method operations
     *
     * @return array Error details for unknown operation
     */
    private function unknownMethod(): array
    {
        http_response_code(self::HTTP_BAD_REQUEST);

        return [
            'code' => self::HTTP_BAD_REQUEST,
            'success' => false,
            'error' => 'Unknown payment method'
        ];
    }
}