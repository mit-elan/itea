<?php

require_once __DIR__ . '/../db/adminDataHandler.php';
require_once __DIR__ . '/../models/user.class.php';

/**
 * Business logic handler for admin operations
 * Routes requests to user management, customer order management, and order item operations
 */
class AdminHandler
{
    private const HTTP_BAD_REQUEST = 400;
    private const HTTP_FORBIDDEN = 403;
    private const HTTP_NOT_FOUND = 404;
    private const HTTP_INTERNAL_SERVER_ERROR = 500;

    private AdminDataHandler $adminDataHandler;

    /**
     * @param AdminDataHandler $adminDataHandler Data access handler for admin operations
     */
    public function __construct(AdminDataHandler $adminDataHandler)
    {
        $this->adminDataHandler = $adminDataHandler;
    }

    /**
     * Routes admin operations to appropriate handler methods
     *
     * @param string $method Operation name (getUsers, setUserActive, getUserOrders, getOrderDetails, getAllOrders, removeOrderItem)
     * @param array $data Request data passed to handler methods
     * @return array Operation result or error details
     */
    public function handle(string $method, array $data = []): array
    {
        return match ($method) {
            'getUsers' => $this->getUsers(),
            'setUserActive' => $this->setUserActive($data),
            'getUserOrders' => $this->getUserOrders($data),
            'getOrderDetails' => $this->getOrderDetails($data),
            'getAllOrders' => $this->getAllOrders(),
            'removeOrderItem' => $this->removeOrderItem($data),

            default => $this->errorResponse(
                self::HTTP_NOT_FOUND,
                'Unknown admin method'
            ),
        };
    }

    /**
     * Creates a standardized error response and sets the matching HTTP status code
     *
     * @param int $code HTTP status code
     * @param string $message Error message for the API response
     * @return array Error response
     */
    private function errorResponse(int $code, string $message): array
    {
        http_response_code($code);

        return [
            'code' => $code,
            'success' => false,
            'error' => $message
        ];
    }

    /**
     * Checks whether the current user has admin permissions
     *
     * @return array|null Error response if unauthorized, otherwise null
     */
    private function requireAdmin(): ?array
    {
        if (!isAdmin()) {
            return $this->errorResponse(
                self::HTTP_FORBIDDEN,
                'Unauthorized'
            );
        }

        return null;
    }

    /**
     * Retrieves all users serialized for admin user management
     *
     * @return array Array of user data arrays or error details
     */
    private function getUsers(): array
    {
        // Admin authorization check
        $authError = $this->requireAdmin();

        if ($authError !== null) {
            return $authError;
        }

        // Load all users for the admin customer overview
        $users = $this->adminDataHandler->getUsers();

        return array_map(
            fn(User $user) => $user->toArray(),
            $users
        );
    }

    /**
     * Updates the active status of a user account
     * Prevents admins from deactivating their own account
     *
     * @param array $data Must contain id and active status
     * @return array Success response or error details
     */
    private function setUserActive(array $data): array
    {
        // Admin authorization check
        $authError = $this->requireAdmin();

        if ($authError !== null) {
            return $authError;
        }

        // Validate user ID
        $userId = (int)($data['id'] ?? 0);

        if ($userId <= 0) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Missing or invalid user id'
            );
        }

        // Validate active status field
        if (!isset($data['active'])) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Missing active status'
            );
        }

        $active = filter_var(
            $data['active'],
            FILTER_VALIDATE_BOOLEAN,
            FILTER_NULL_ON_FAILURE
        );

        if ($active === null) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Invalid active status'
            );
        }

        // Prevent admins from deactivating their own account
        if (isset($_SESSION['user_id']) && $userId === (int)$_SESSION['user_id']) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'You cannot deactivate your own account'
            );
        }

        // Update user active status
        $success = $this->adminDataHandler->setUserActive($userId, $active);

        if (!$success) {
            return $this->errorResponse(
                self::HTTP_INTERNAL_SERVER_ERROR,
                'Failed to update user status'
            );
        }

        return [
            'success' => true,
            'message' => 'User status updated successfully'
        ];
    }

    /**
     * Retrieves all orders for a specific user
     *
     * @param array $data Must contain userId
     * @return array Array of user orders or error details
     */
    private function getUserOrders(array $data): array
    {
        // Admin authorization check
        $authError = $this->requireAdmin();

        if ($authError !== null) {
            return $authError;
        }

        // Validate user ID
        $userId = (int)($data['userId'] ?? 0);

        if ($userId <= 0) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Missing or invalid user id'
            );
        }

        // Load all orders for the selected user
        return $this->adminDataHandler->getOrdersByUserId($userId);
    }

    /**
     * Retrieves one order with its related order items
     *
     * @param array $data Must contain orderId
     * @return array Response with order and items or error details
     */
    private function getOrderDetails(array $data): array
    {
        // Admin authorization check
        $authError = $this->requireAdmin();

        if ($authError !== null) {
            return $authError;
        }

        // Validate order ID
        $orderId = (int)($data['orderId'] ?? 0);

        if ($orderId <= 0) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Missing or invalid order id'
            );
        }

        // Load order header information
        $order = $this->adminDataHandler->getOrderById($orderId);

        if (!$order) {
            return $this->errorResponse(
                self::HTTP_NOT_FOUND,
                'Order not found'
            );
        }

        // Load all items belonging to the selected order
        $items = $this->adminDataHandler->getOrderItems($orderId);

        return [
            'success' => true,
            'order' => $order,
            'items' => $items
        ];
    }

    /**
     * Removes one item from an order and recalculates the order total
     *
     * @param array $data Must contain orderItemId and orderId
     * @return array Success response or error details
     */
    private function removeOrderItem(array $data): array
    {
        // Admin authorization check
        $authError = $this->requireAdmin();

        if ($authError !== null) {
            return $authError;
        }

        // Validate order item ID
        $orderItemId = (int)($data['orderItemId'] ?? 0);
        $orderId = (int)($data['orderId'] ?? 0);

        if ($orderItemId <= 0) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Missing or invalid order item id'
            );
        }

        // Validate order ID
        if ($orderId <= 0) {
            return $this->errorResponse(
                self::HTTP_BAD_REQUEST,
                'Missing or invalid order id'
            );
        }

        // Remove order item
        $success = $this->adminDataHandler->removeOrderItem($orderItemId);

        if (!$success) {
            return $this->errorResponse(
                self::HTTP_INTERNAL_SERVER_ERROR,
                'Failed to remove order item'
            );
        }

        // Recalculate total after removing the item
        $totalUpdated = $this->adminDataHandler->recalculateOrderTotal($orderId);

        if (!$totalUpdated) {
            return $this->errorResponse(
                self::HTTP_INTERNAL_SERVER_ERROR,
                'Order item was removed, but order total could not be updated'
            );
        }

        return [
            'success' => true,
            'message' => 'Order item removed successfully'
        ];
    }

    /**
     * Retrieves all customer orders for the admin order overview
     *
     * @return array Array of all orders or error details
     */
    private function getAllOrders(): array
    {
        // Admin authorization check
        $authError = $this->requireAdmin();

        if ($authError !== null) {
            return $authError;
        }

        // Load all orders for admin order management
        return $this->adminDataHandler->getAllOrders();
    }
}