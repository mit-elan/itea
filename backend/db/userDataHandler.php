<?php

require_once __DIR__ . '/dbaccess.php';

/**
 * Data access layer for user persistence, authentication, and profile management.
 * Handles all database operations related to user accounts.
 */
class UserDataHandler
{
    private mysqli $db;

    /**
     * Initializes the user data handler with a database connection.
     *
     * @param DBaccess $db Database connection handler
     */
    public function __construct(DBaccess $db)
    {
        $this->db = $db->getConnection();
    }

    /**
     * Retrieves a user by username or email address.
     * The username comparison is case-sensitive, while the email comparison follows the database collation.
     *
     * @param string $identifier Username or email address
     * @return array|null User data if found, null otherwise
     */
    public function getUserByIdentifier(string $identifier): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT id,
                    salutation,
                    first_name,
                    last_name,
                    address,
                    zip,
                    city,
                    email,
                    username,
                    password,
                    role,
                    active
             FROM user
             WHERE BINARY username = ?
                OR email = ?
             LIMIT 1"
        );

        $stmt->bind_param(
            "ss",
            $identifier,
            $identifier
        );

        $stmt->execute();

        $user = $stmt
            ->get_result()
            ->fetch_assoc();

        return $user ?: null;
    }

    /**
     * Retrieves a user by their database ID.
     *
     * @param int $id User identifier
     * @return array|null User data if found, null otherwise
     */
    public function getUserById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT id,
                    salutation,
                    first_name,
                    last_name,
                    address,
                    zip,
                    city,
                    email,
                    username,
                    password,
                    role,
                    active
             FROM user
             WHERE id = ?
             LIMIT 1"
        );

        $stmt->bind_param("i", $id);
        $stmt->execute();

        $user = $stmt
            ->get_result()
            ->fetch_assoc();

        return $user ?: null;
    }

    /**
     * Saves a remember-me token for persistent login across browser sessions
     *
     * @param int $id User identifier
     * @param string $token Unique token for remember-me functionality
     * @return bool True if the token was saved successfully
     */
    public function saveRememberToken(int $id, string $token): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE user
             SET remember_token = ?
             WHERE id = ?"
        );

        $stmt->bind_param("si", $token, $id);

        return $stmt->execute();
    }

    /**
     * Retrieves a user by their remember-me token
     *
     * @param string $token Remember-me token
     * @return array|null User data if found, null otherwise
     */
    public function getUserByRememberToken(string $token): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT id,
                    salutation,
                    first_name,
                    last_name,
                    address,
                    zip,
                    city,
                    email,
                    username,
                    password,
                    role,
                    active
             FROM user
             WHERE remember_token = ?
             LIMIT 1"
        );

        $stmt->bind_param("s", $token);
        $stmt->execute();

        $user = $stmt
            ->get_result()
            ->fetch_assoc();

        return $user ?: null;
    }

    /**
     * Clears the remember-me token for a user (called on logout)
     *
     * @param int $id User identifier
     * @return bool True if the token was cleared successfully
     */
    public function clearRememberToken(int $id): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE user
             SET remember_token = NULL
             WHERE id = ?"
        );

        $stmt->bind_param("i", $id);

        return $stmt->execute();
    }

    /**
     * Updates profile data for an existing user.
     *
     * @param int $id User identifier
     * @param array $data Updated profile data with firstname, lastname, email, address, zip, and city
     * @return bool True if the update query executed successfully
     */
    public function updateUser(int $id, array $data): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE user
             SET first_name = ?,
                 last_name = ?,
                 email = ?,
                 address = ?,
                 zip = ?,
                 city = ?
             WHERE id = ?"
        );

        $stmt->bind_param(
            "ssssssi",
            $data['firstname'],
            $data['lastname'],
            $data['email'],
            $data['address'],
            $data['zip'],
            $data['city'],
            $id
        );

        return $stmt->execute();
    }

    /**
     * Creates a new customer user account.
     * The password is hashed before it is stored.
     *
     * @param array $data Registration data with salutation, firstname, lastname, address, zip, city, email, username, and password
     * @return int|string New user ID on success, doubleEntry for duplicate data, or databaseError on database failure
     */
    public function createUser(array $data): string|int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO user (
                salutation,
                first_name,
                last_name,
                address,
                zip,
                city,
                email,
                username,
                password,
                role,
                active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );

        $password = password_hash(
            $data['password'],
            PASSWORD_DEFAULT
        );

        $role = 'customer';
        $active = 1;

        $stmt->bind_param(
            "ssssssssssi",
            $data['salutation'],
            $data['firstname'],
            $data['lastname'],
            $data['address'],
            $data['zip'],
            $data['city'],
            $data['email'],
            $data['username'],
            $password,
            $role,
            $active
        );

        try {
            $stmt->execute();

            return $stmt->insert_id;
        } catch (mysqli_sql_exception $e) {
            if ($e->getCode() === 1062) {
                return "doubleEntry";
            }

            return "databaseError";
        }
    }
}