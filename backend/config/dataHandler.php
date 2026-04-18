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

    // public function getProducts(): array { 
    //$result = $this->db->query("SELECT * FROM products");
    // return $result->fetch_all(MYSQLI_ASSOC);
    //}}
    // public function getProductsByCategory(int $categoryId): array { ... }
    // public function searchProducts(string $term): array { ... }
    // public function getCategories(): array { ... }

    // ── Sprint 1: User / Auth ─────────────────────────────────────
    // public function getUserByUsername(string $username): ?array { ... }
    // public function getUserByEmail(string $email): ?array { ... }
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
        try {
            $stmt->execute();
            return true;
        } catch (mysqli_sql_exception $e) {
            if ($e->getCode() == 1062) {
                return "doubleEntry";
            }
            return false;
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
