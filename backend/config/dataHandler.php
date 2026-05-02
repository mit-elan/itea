<?php

/**
 * Zentrale DB-Service-Klasse.
 * Alle Datenbankzugriffe laufen ausschließlich über diese Klasse.
 * Sprint 0: Grundgerüst – Methoden werden pro Sprint ergänzt.
 */

require_once __DIR__ . '/dbaccess.php';

class DataHandler
{

    private $db;

    // Verbindung wird beim Erstellen des DataHandlers aufgebaut
    public function __construct()
    {
        $this->db = getDatabaseConnection();
    }
    // ── Sprint 1: Produkte ────────────────────────────────────────#

    public function getProducts(): array
    {
        $result = $this->db->query("SELECT * FROM product");
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public function getProductsByCategory(int $categoryId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM product WHERE category_id = ?");
        $stmt->bind_param("i", $categoryId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        return $result;
    }

    public function getProductById(int $id): array
    {
        $stmt = $this->db->prepare("SELECT * FROM product WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc() ?: [];
        return $result;
    }

    // public function searchProducts(string $term): array {}
    // public function getCategories(): array { ... }

    // ── Sprint 1: User / Auth ─────────────────────────────────────
    public function getUserByIdentifier(string $identifier): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT id, salutation, first_name, last_name, address, zip, city, email, username, password, role, active
             FROM user
             WHERE BINARY username = ? OR email = ?
             LIMIT 1"
        );

        $stmt->bind_param("ss", $identifier, $identifier);
        $stmt->execute();

        $user = $stmt->get_result()->fetch_assoc();

        if (!$user) {
            return null;
        }

        return $user;
    }
    public function createUser(array $data): string|bool
    {
        $stmt = $this->db->prepare("INSERT INTO user (salutation, first_name, last_name, address, zip, city, email, username, password, role, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $password = password_hash($data['password'], PASSWORD_DEFAULT);
        $active = 1; // Standardmäßig aktiv
        $role = 'customer'; // Standardrolle

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
        //Füge User in DB ein - Catch error 1062: Doppelter Eintrag
        //Gib als Success den String "doubleEntry" zurück an userHandler
        try {
            $stmt->execute();
            return true;
        } catch (mysqli_sql_exception $e) {
            if ($e->getCode() == 1062) {
                return "doubleEntry";
            }
            return "databaseError";
        }
    }


    // ── Sprint 2: Warenkorb / Bestellungen ───────────────────────
    // public function createOrder(array $data): int { ... }
    // public function getOrdersByUser(int $userId): array { ... }

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
