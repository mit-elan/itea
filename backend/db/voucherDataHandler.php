<?php

require_once __DIR__ . '/dbaccess.php';
require_once __DIR__ . '/../models/voucher.class.php';

/**
 * VoucherDataHandler
 *
 * Manages database operations for vouchers including CRUD operations and redemption tracking.
 */
class VoucherDataHandler
{
    private mysqli $db;

    /**
     * Initializes the VoucherDataHandler with a database connection.
     *
     * @param DBaccess $db Database access object
     */
    public function __construct(DBaccess $db)
    {
        $this->db = $db->getConnection();
    }


    /**
     * Creates a new voucher record in the database.
     *
     * Sets remaining_value equal to the initial value upon creation.
     *
     * @param Voucher $voucher The voucher object containing code, value, and valid_until
     * @return bool True if the insert was successful, false otherwise
     */
    public function createVoucher(Voucher $voucher): bool
    {
        $stmt = $this->db->prepare(
            "INSERT INTO vouchers (code, value, remaining_value, valid_until) VALUES (?, ?, ?, ?)"
        );
        if (!$stmt) return false;
        $stmt->bind_param("sdds", $voucher->code, $voucher->value, $voucher->value, $voucher->valid_until);
        return $stmt->execute();
    }

    /**
     * Retrieves all vouchers from the database.
     *
     * Results are ordered by expiry date in descending order (soonest expiration first).
     *
     * @return Voucher[] Array of all voucher objects, or empty array if query fails
     */
    public function getVouchers(): array
    {
        $stmt = $this->db->prepare(
            "SELECT id, code, value, remaining_value, valid_until, redeemed, user_id FROM vouchers ORDER BY valid_until DESC"
        );
        if (!$stmt) return [];
        $stmt->execute();
        $result = $stmt->get_result();

        $vouchers = [];
        while ($row = $result->fetch_assoc()) {
            $vouchers[] = new Voucher($row);
        }

        return $vouchers;
    }

    /**
     * Retrieves all vouchers assigned to a specific user.
     *
     * Results are ordered by expiry date in descending order (soonest expiration first).
     * Does not include user_id in the result set.
     *
     * @param int $userId The user ID to filter vouchers by
     * @return Voucher[] Array of voucher objects assigned to the user, or empty array if query fails
     */
    public function getVouchersByUserId(int $userId): array
    {
        $stmt = $this->db->prepare(
            "SELECT id, code, value, remaining_value, valid_until, redeemed FROM vouchers WHERE user_id = ? ORDER BY valid_until DESC"
        );
        if (!$stmt) return [];
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        $vouchers = [];
        while ($row = $result->fetch_assoc()) {
            $vouchers[] = new Voucher($row);
        }

        return $vouchers;
    }

    /**
     * Retrieves a voucher by its code.
     *
     * @param string $code The unique voucher code to search for
     * @return Voucher|null The voucher object if found, null if not found or query fails
     */
    public function getVoucherByCode(string $code): ?Voucher
    {
        $stmt = $this->db->prepare(
            "SELECT id, code, value, remaining_value, valid_until, redeemed, user_id FROM vouchers WHERE code = ?"
        );
        if (!$stmt) return null;
        $stmt->bind_param("s", $code);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        return $row ? new Voucher($row) : null;
    }


    /**
     * Redeems a voucher against a cart total and updates its remaining value.
     *
     * Calculates the new remaining value after applying the discount to the cart total.
     * Marks voucher as fully redeemed if remaining value becomes zero or negative.
     *
     * @param Voucher $voucher The voucher to redeem
     * @param float $cartTotal The cart total to apply the discount against
     * @return float The final amount owed after discount applied (0 if discount exceeds cart total)
     */
    public function redeemVoucher(Voucher $voucher, float $cartTotal): float
    {
        if ($voucher->remaining_value >= $cartTotal) {
            $newRemaining = $voucher->remaining_value - $cartTotal;
            $newTotal     = 0.0;
        } else {
            $newRemaining = 0.0;
            $newTotal     = $cartTotal - $voucher->remaining_value;
        }

        $redeemed = ($newRemaining <= 0) ? 1 : 0;

        $stmt = $this->db->prepare(
            "UPDATE vouchers SET remaining_value = ?, redeemed = ? WHERE id = ?"
        );
        if (!$stmt) return $cartTotal;
        $stmt->bind_param("dii", $newRemaining, $redeemed, $voucher->id);
        $stmt->execute();

        return $newTotal;
    }

    /**
     * Assigns a voucher to a specific user.
     *
     * @param Voucher $voucher The voucher to assign
     * @param int $userId The user ID to assign the voucher to
     * @return bool True if the update was successful, false otherwise
     */
    public function assignVoucherToUser(Voucher $voucher, int $userId): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE vouchers SET user_id = ? WHERE id = ?"
        );
        if (!$stmt) return false;
        $stmt->bind_param("ii", $userId, $voucher->id);
        return $stmt->execute();
    }
}
