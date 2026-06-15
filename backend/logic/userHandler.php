<?php

require_once __DIR__ . '/../models/user.class.php';
require_once __DIR__ . '/../models/cart.class.php';

/**
 * Business logic handler for user operations
 * Routes requests to authentication, registration, profile, and session status methods
 */
class UserHandler
{
    private const HTTP_BAD_REQUEST = 400;
    private const HTTP_UNAUTHORIZED = 401;
    private const HTTP_FORBIDDEN = 403;
    private const HTTP_NOT_FOUND = 404;
    private const HTTP_CONFLICT = 409;
    private const HTTP_INTERNAL_SERVER_ERROR = 500;

    private UserDataHandler $userDataHandler;
    private CartDataHandler $cartDataHandler;
    private PaymentDataHandler $paymentDataHandler;

    /**
     * @param UserDataHandler $userDataHandler Data access handler for users
     * @param CartDataHandler $cartDataHandler Data access handler for cart persistence
     * @param PaymentDataHandler $paymentDataHandler Data access handler for payment methods
     */
    public function __construct(
        UserDataHandler $userDataHandler,
        CartDataHandler $cartDataHandler,
        PaymentDataHandler $paymentDataHandler
    ) {
        $this->userDataHandler = $userDataHandler;
        $this->cartDataHandler = $cartDataHandler;
        $this->paymentDataHandler = $paymentDataHandler;
    }

    /**
     * Routes user operations to appropriate handler methods
     *
     * @param string $method Operation name (login, register, logout, status, getProfile, updateProfile)
     * @param array $data Request data passed to handler methods
     * @return array Operation result or error details
     */
    public function handle(string $method, array $data = []): array
    {
        return match ($method) {
            'login' => $this->login($data),
            'register' => $this->register($data),
            'logout' => $this->logout(),
            'status' => $this->status(),
            'getProfile' => $this->getProfile(),
            'updateProfile' => $this->updateProfile($data),

            default => $this->errorResponse(
                self::HTTP_NOT_FOUND,
                'Unknown user method'
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
     * Logs in a user by username or email and merges guest cart with persisted cart
     *
     * @param array $data Must contain identifier and password
     * @return array Success response with user data or error details
     */
    private function login(array $data): array
    {
        // Validate required login fields
        foreach (['identifier', 'password'] as $field) {
            if (empty($data[$field])) {
                return $this->errorResponse(
                    self::HTTP_BAD_REQUEST,
                    "Field '$field' is required"
                );
            }
        }

        $identifier = trim($data['identifier']);
        $password = $data['password'];

        // Load user by username or email
        $userData = $this->userDataHandler->getUserByIdentifier($identifier);

        if (!$userData) {
            return $this->errorResponse(
                self::HTTP_UNAUTHORIZED,
                'Invalid username/email or password'
            );
        }

        // Create user model from database data
        $user = new User($userData);

        // Prevent inactive users from logging in
        if (!$user->active) {
            return $this->errorResponse(
                self::HTTP_FORBIDDEN,
                'This account is inactive'
            );
        }

        // Validate password against stored password hash
        if (!$user->checkPassword($password)) {
            return $this->errorResponse(
                self::HTTP_UNAUTHORIZED,
                'Invalid username/email or password'
            );
        }

        // Preserve guest cart BEFORE regenerating session (session_regenerate_id destroys old data)
        $guestCart = $_SESSION['cart'] ?? [];

        // Store logged-in user data in the session
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user->id;
        $_SESSION['username'] = $user->username;
        $_SESSION['role'] = $user->role;

        // Handle remember-me functionality if requested
        if (!empty($data['remember'])) {
            $rememberToken = bin2hex(random_bytes(32));
            $this->userDataHandler->saveRememberToken($user->id, $rememberToken);

            // Set persistent cookie that survives browser closure (30 days)
            setcookie(
                'remember_token',
                $rememberToken,
                time() + (30 * 24 * 60 * 60),
                '/',
                '',
                false,
                true
            );
        }

        // Load persisted cart from database
        $dbCart = [];

        foreach ($this->cartDataHandler->loadCartFromDb($user->id) as $item) {
            $dbCart[$item->product_id] = $item->quantity;
        }

        // Merge guest cart into persisted cart by accumulating quantities
        foreach ($guestCart as $productId => $quantity) {
            $dbCart[$productId] = ($dbCart[$productId] ?? 0) + $quantity;
        }

        $_SESSION['cart'] = $dbCart;

        return [
            'success' => true,
            'message' => 'Login successful',
            'userId' => $user->id,
            'username' => $user->username,
            'role' => $user->role,
        ];
    }

    /**
     * Logs out the current user and persists the session cart before destroying the session
     * Also clears the remember-me token and cookie
     *
     * @return array Success response
     */
    private function logout(): array
    {
        // Clear remember-me token from database if user is logged in
        if (isset($_SESSION['user_id'])) {
            $this->userDataHandler->clearRememberToken((int)$_SESSION['user_id']);
        }

        // Persist cart to database before clearing the session
        if (isset($_SESSION['user_id']) && !empty($_SESSION['cart'])) {
            $userId = (int)$_SESSION['user_id'];
            $cartItems = [];

            foreach ($_SESSION['cart'] as $productId => $quantity) {
                $cartItems[] = new Cart([
                    'userId' => $userId,
                    'productId' => (int)$productId,
                    'quantity' => $quantity,
                ]);
            }

            $this->cartDataHandler->saveCartToDb($userId, $cartItems);
        }

        // Clear session data
        $_SESSION = [];

        // Remove session cookie if session cookies are enabled
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();

            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }

        // Clear remember-me cookie
        setcookie(
            'remember_token',
            '',
            time() - 3600,
            '/',
            '',
            false,
            true
        );

        session_destroy();

        return [
            'success' => true,
            'message' => 'Logout successful'
        ];
    }

    /**
     * Registers a new customer account and creates the initial payment method
     *
     * @param array $data User and payment method registration data
     * @return array Success response or error details
     */
    private function register(array $data): array
    {
        // Validate required user fields
        foreach (
            [
                'salutation',
                'firstname',
                'lastname',
                'address',
                'zip',
                'city',
                'email',
                'username',
                'password'
            ] as $field
        ) {
            if (empty($data[$field])) {
                return $this->errorResponse(
                    self::HTTP_BAD_REQUEST,
                    "Field '$field' is required"
                );
            }
        }

        // Validate required payment method fields
        foreach (['paymentName', 'paymentType', 'cardNumber'] as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                return $this->errorResponse(
                    self::HTTP_BAD_REQUEST,
                    "Field '$field' is required"
                );
            }
        }

        // Create user account
        $userId = $this->userDataHandler->createUser($data);

        if (is_int($userId)) {
            $paymentCreated = $this->paymentDataHandler->createPaymentMethod(
                $userId,
                $data
            );

            if (!$paymentCreated) {
                return $this->errorResponse(
                    self::HTTP_INTERNAL_SERVER_ERROR,
                    'User was created, but payment method could not be saved'
                );
            }

            return [
                'success' => true,
                'message' => 'Registration successful'
            ];
        }

        if ($userId === 'doubleEntry') {
            return $this->errorResponse(
                self::HTTP_CONFLICT,
                'Email or username already taken!'
            );
        }

        return $this->errorResponse(
            self::HTTP_INTERNAL_SERVER_ERROR,
            'Registration failed due to a database error'
        );
    }

    /**
     * Returns current login status and cart count for navigation and access checks
     *
     * @return array Session status response
     */
    private function status(): array
    {
        $cartCount = array_sum($_SESSION['cart'] ?? []);

        if (!isset($_SESSION['user_id'])) {
            return [
                'loggedIn' => false,
                'userId' => null,
                'role' => 'guest',
                'cartCount' => $cartCount
            ];
        }

        return [
            'loggedIn' => true,
            'userId' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'role' => $_SESSION['role'],
            'cartCount' => $cartCount
        ];
    }

    /**
     * Retrieves the profile data of the currently logged-in user
     *
     * @return array User profile data or error details
     */
    private function getProfile(): array
    {
        // User authentication check
        if (!isset($_SESSION['user_id'])) {
            return $this->errorResponse(
                self::HTTP_UNAUTHORIZED,
                'You must be logged in'
            );
        }

        // Load current user profile
        $userData = $this->userDataHandler->getUserById(
            (int)$_SESSION['user_id']
        );

        if (!$userData) {
            return $this->errorResponse(
                self::HTTP_NOT_FOUND,
                'User not found'
            );
        }

        $user = new User($userData);

        return $user->toArray();
    }

    /**
     * Updates the profile data of the currently logged-in user after password confirmation
     *
     * @param array $data Updated profile data including password confirmation
     * @return array Success response or error details
     */
    private function updateProfile(array $data): array
    {
        // User authentication check
        if (!isset($_SESSION['user_id'])) {
            return $this->errorResponse(
                self::HTTP_UNAUTHORIZED,
                'You must be logged in'
            );
        }

        // Load current user before updating
        $userData = $this->userDataHandler->getUserById(
            (int)$_SESSION['user_id']
        );

        if (!$userData) {
            return $this->errorResponse(
                self::HTTP_NOT_FOUND,
                'User not found'
            );
        }

        $user = new User($userData);
        $password = $data['password'] ?? '';

        // Confirm password before allowing profile updates
        if (!$user->checkPassword($password)) {
            return $this->errorResponse(
                self::HTTP_UNAUTHORIZED,
                'Incorrect password'
            );
        }

        // Validate required fields before database update
        $requiredFields = ['firstname', 'lastname', 'email', 'address', 'zip', 'city'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                return $this->errorResponse(
                    self::HTTP_BAD_REQUEST,
                    "Field '$field' is required"
                );
            }
        }

        // Persist profile changes
        try {
            $success = $this->userDataHandler->updateUser(
                (int)$_SESSION['user_id'],
                $data
            );

            if (!$success) {
                return $this->errorResponse(
                    self::HTTP_INTERNAL_SERVER_ERROR,
                    'Failed to update profile'
                );
            }
        } catch (mysqli_sql_exception $e) {
            // Handle duplicate email error
            if ($e->getCode() === 1062) {
                return $this->errorResponse(
                    self::HTTP_CONFLICT,
                    'Email address is already in use. Please choose a different email.'
                );
            }

            return $this->errorResponse(
                self::HTTP_INTERNAL_SERVER_ERROR,
                'Database error occurred'
            );
        }

        return [
            'success' => true
        ];
    }
}