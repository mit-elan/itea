<?php

/**
 * Zentrale DB-Service-Klasse.
 * Alle Datenbankzugriffe laufen ausschließlich über diese Klasse.
 * Sprint 0: Grundgerüst – Methoden werden pro Sprint ergänzt.
 * eigener database gateways ordner // und handler trennen
 */

require_once __DIR__ . '/dbaccess.php';

class DataHandler
{

    private mysqli $db;

    public function __construct(DBaccess $db)
    {
        $this->db = $db->getConnection();
    }

    // ── Sprint 1: Produkte ────────────────────────────────────────#

    // ── Sprint 1: User / Auth ─────────────────────────────────────

    // Für Login: User über Username oder E-Mail identifizieren
    public function getUserByIdentifier(
        string $identifier
    ): ?array {

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

    // Für bereits eingeloggte user: Userdaten über Session-ID holen
    public function getUserById(
        int $id
    ): ?array {

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

    public function updateUser(
        int $id,
        array $data
    ): bool {

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

    public function createUser(
        array $data
    ): string|int {

        $stmt = $this->db->prepare(
            "INSERT INTO user
            (
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

        $active = 1;

        $role = 'customer';

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

            if ($e->getCode() == 1062) {
                return "doubleEntry";
            }

            return "databaseError";
        }
    }
    // ── Sprint 2: Warenkorb / Payment ────────────────────────────

    // Ersetzt den gespeicherten DB-Cart eines Users komplett durch den Session-Cart.
    // Wird beim Logout aufgerufen.

    // ── Sprint 3: Admin ───────────────────────────────────────────

    // public function createProduct(array $data): bool { ... }
    // public function updateProduct(int $id, array $data): bool { ... }
    // public function deleteProduct(int $id): bool { ... }
    // public function getAllUsers(): array { ... }
    // public function setUserActive(int $id, bool $active): bool { ... }

    // ── Sprint 4: Gutscheine ──────────────────────────────────────

    // public function createCoupon(array $data): bool { ... }
    // public function getCouponByCode(string $code): ?array { ... }
    // public function redeemCoupon(string $code, int $userId): bool { ... }
}