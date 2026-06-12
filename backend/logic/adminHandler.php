<?php

require_once __DIR__ . '/../db/adminDataHandler.php';
require_once __DIR__ . '/../models/user.class.php';

/**
 * AdminHandler
 * Sprint 3: Kundenverwaltung
 * Sprint 4: Gutscheinverwaltung
 */
class AdminHandler
{
    private AdminDataHandler $adminDataHandler;

    public function __construct(AdminDataHandler $adminDataHandler)
    {
        $this->adminDataHandler = $adminDataHandler;
    }

    public function handle(string $method, array $data = []): ?array
    {
        return match ($method) {
            'getUsers' => $this->getUsers(),
            'setUserActive' => $this->setUserActive($data),
            'getUserOrders' => $this->getUserOrders($data),
            'getOrderDetails' => $this->getOrderDetails($data),
            'getAllOrders' => $this->getAllOrders(),
            'removeOrderItem' => $this->removeOrderItem($data),
            default => [
                'code' => 404,
                'error' => 'Unknown admin method'
            ],
        };
    }

    private function requireAdmin(): ?array
    {
        if (!isAdmin()) {
            return [
                'code' => 403,
                'error' => 'Unauthorized'
            ];
        }

        return null;
    }

    private function getUsers(): array
    {
        $authError = $this->requireAdmin();

        if ($authError !== null) {
            return $authError;
        }

        $users = $this->adminDataHandler->getUsers();

        return array_map(
            fn(User $user) => $user->toArray(),
            $users
        );
    }

    private function setUserActive(array $data): array
    {
        $authError = $this->requireAdmin();

        if ($authError !== null) {
            return $authError;
        }

        $userId = (int) ($data['id'] ?? 0);

        if ($userId <= 0) {
            return [
                'code' => 400,
                'error' => 'Missing or invalid user id'
            ];
        }

        if (!isset($data['active'])) {
            return [
                'code' => 400,
                'error' => 'Missing active status'
            ];
        }

        $active = filter_var(
            $data['active'],
            FILTER_VALIDATE_BOOLEAN,
            FILTER_NULL_ON_FAILURE
        );

        if ($active === null) {
            return [
                'code' => 400,
                'error' => 'Invalid active status'
            ];
        }

        if (isset($_SESSION['user_id']) && $userId === (int) $_SESSION['user_id']) {
            return [
                'code' => 400,
                'error' => 'You cannot deactivate your own account'
            ];
        }

        $success = $this->adminDataHandler->setUserActive($userId, $active);

        if (!$success) {
            return [
                'code' => 500,
                'error' => 'Failed to update user status'
            ];
        }

        return [
            'message' => 'User status updated successfully'
        ];
    }

    private function getUserOrders(array $data): array
    {
        $authError = $this->requireAdmin();

        if ($authError !== null) {
            return $authError;
        }

        $userId = (int) ($data['userId'] ?? 0);

        if ($userId <= 0) {
            return [
                'code' => 400,
                'error' => 'Missing or invalid user id'
            ];
        }

        return $this->adminDataHandler->getOrdersByUserId($userId);
    }

    private function getOrderDetails(array $data): array
    {
        $authError = $this->requireAdmin();

        if ($authError !== null) {
            return $authError;
        }

        $orderId = (int) ($data['orderId'] ?? 0);

        if ($orderId <= 0) {
            return [
                'code' => 400,
                'error' => 'Missing or invalid order id'
            ];
        }

        $order = $this->adminDataHandler->getOrderById($orderId);

        if (!$order) {
            return [
                'code' => 404,
                'error' => 'Order not found'
            ];
        }

        $items = $this->adminDataHandler->getOrderItems($orderId);

        return [
            'order' => $order,
            'items' => $items
        ];
    }

    private function removeOrderItem(array $data): array
    {
        $authError = $this->requireAdmin();

        if ($authError !== null) {
            return $authError;
        }

        $orderItemId = (int) ($data['orderItemId'] ?? 0);
        $orderId = (int) ($data['orderId'] ?? 0);

        if ($orderItemId <= 0) {
            return [
                'code' => 400,
                'error' => 'Missing or invalid order item id'
            ];
        }

        if ($orderId <= 0) {
            return [
                'code' => 400,
                'error' => 'Missing or invalid order id'
            ];
        }

        $success = $this->adminDataHandler->removeOrderItem($orderItemId);

        if (!$success) {
            return [
                'code' => 500,
                'error' => 'Failed to remove order item'
            ];
        }

        $totalUpdated = $this->adminDataHandler->recalculateOrderTotal($orderId);

        if (!$totalUpdated) {
            return [
                'code' => 500,
                'error' => 'Order item was removed, but order total could not be updated'
            ];
        }

        return [
            'message' => 'Order item removed successfully'
        ];
    }

    private function getAllOrders(): array
    {
        $authError = $this->requireAdmin();

        if ($authError !== null) {
            return $authError;
        }

        return $this->adminDataHandler->getAllOrders();
    }
}