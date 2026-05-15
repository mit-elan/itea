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

    // Für Login: User über Username oder E-Mail identifizieren
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
    public function createUser(array $data): string|int
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
            return $stmt->insert_id; // neue User-ID zurückgeben
        } catch (mysqli_sql_exception $e) {
            if ($e->getCode() == 1062) {
                return "doubleEntry";
            }
            return "databaseError";
        }
    }

    public function createPaymentMethod(int $userId, array $data): bool
    {
        $isBankAccount = ($data['paymentType'] ?? '') === '1' ? 1 : 0;
        $cardNumber    = $data['cardNumber'] ?? '';
        $label         = $data['paymentName'] ?? '';


        $stmt = $this->db->prepare(
            "INSERT INTO payment_method (user_id, is_bank_account, card_number, label) VALUES (?, ?, ?, ?)"
        );
        $stmt->bind_param("iiss", $userId, $isBankAccount, $cardNumber, $label);

        try {
            $stmt->execute();
            return true;
        } catch (mysqli_sql_exception $e) {
            return false;
        }
    }


    // ── Sprint 2: Warenkorb / Bestellungen ───────────────────────

    // Ersetzt den gespeicherten DB-Cart eines Users komplett durch den Session-Cart.
    // Wird beim Logout aufgerufen.
    public function saveCartToDb(int $userId, array $sessionCart): void
    {
        $stmt = $this->db->prepare("DELETE FROM cart WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();

        if (empty($sessionCart)) return;

        $stmt = $this->db->prepare(
            "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)"
        );
        foreach ($sessionCart as $productId => $quantity) {
            if ($quantity > 0) {
                $stmt->bind_param("iii", $userId, $productId, $quantity);
                $stmt->execute();
            }
        }
    }

    // Lädt den DB-Cart eines Users als Session-Format zurück: [product_id => quantity].
    // Wird beim Login aufgerufen.
    public function loadCartFromDb(int $userId): array
    {
        $stmt = $this->db->prepare("SELECT product_id, quantity FROM cart WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        $cart = [];
        foreach ($rows as $row) {
            $cart[$row['product_id']] = $row['quantity'];
        }
        return $cart;
    }

    public function createOrder(Order $order): array
    //Das noch leichter machen ohne diesen Datums String
    {
        $stmt = $this->db->prepare(
            "INSERT INTO `order` (user_id, total_price, payment_method_id) VALUES (?, ?, ?)"
        );
        $stmt->bind_param("idi", $order->userId, $order->totalPrice, $order->paymentMethodId);
        $stmt->execute();
        $orderId = $stmt->insert_id;

        $invoiceNumber = 'INV-' . date('Ymd') . '-' . + $orderId;

        $stmt = $this->db->prepare("UPDATE `order` SET invoice_number = ? WHERE id = ?");
        $stmt->bind_param("si", $invoiceNumber, $orderId);
        $stmt->execute();

        $stmt = $this->db->prepare(
            "INSERT INTO order_item (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)"
        );
        foreach ($order->items as $item) {
            $stmt->bind_param("iiid", $orderId, $item['product_id'], $item['quantity'], $item['unit_price']);
            $stmt->execute();
        }

        return ['orderId' => $orderId, 'invoiceNumber' => $invoiceNumber];
    }

    public function getPaymentMethodsByUserId(int $userId): array
    {
        $stmt = $this->db->prepare("SELECT id, is_bank_account, card_number, label FROM payment_method WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

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


