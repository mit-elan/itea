<?php

require_once __DIR__ . '/dbaccess.php';
require_once __DIR__ . '/../models/voucher.class.php';

/**
 * Data access layer for voucher persistence.
 * Handles voucher creation, retrieval, assignment, and redemption updates.
 */
class VoucherDataHandler
{
    private mysqli $db;

    /**
     * Initializes the voucher data handler with a database connection.
     *
     * @param DBaccess $db Database connection handler
     */
    public function __construct(DBaccess $db)
    {
        $this->db = $db->getConnection();
    }

    /**
     * Creates a new voucher record in the database.
     * The remaining value is initialized with the original voucher value.
     *
     * @param Voucher $voucher Voucher object with code, value, and valid_until
     * @return bool True if the voucher was created successfully
     */
    public function createVoucher(Voucher $voucher): bool
    {
        $stmt = $this->db->prepare(
            "INSERT INTO vouchers (
                code,
                value,
                remaining_value,
                valid_until
            ) VALUES (?, ?, ?, ?)"
        );

        if (!$stmt) {
            return false;
        }

        $stmt->bind_param(
            "sdds",
            $voucher->code,
            $voucher->value,
            $voucher->value,
            $voucher->valid_until
        );

        return $stmt->execute();
    }

    /**
     * Retrieves all vouchers from the database.
     * Results are ordered by expiry date with the soonest expiration first.
     *
     * @return array Array of Voucher objects
     */
    public function getVouchers(): array
    {
        $stmt = $this->db->prepare(
            "SELECT id,
                    code,
                    value,
                    remaining_value,
                    valid_until,
                    redeemed,
                    user_id
             FROM vouchers
             ORDER BY valid_until ASC"
        );

        if (!$stmt) {
            return [];
        }

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
     * Results are ordered by expiry date with the soonest expiration first.
     *
     * @param int $userId User identifier
     * @return array Array of Voucher objects assigned to the user
     */
    public function getVouchersByUserId(int $userId): array
    {
        $stmt = $this->db->prepare(
            "SELECT id,
                    code,
                    value,
                    remaining_value,
                    valid_until,
                    redeemed,
                    user_id
             FROM vouchers
             WHERE user_id = ?
             ORDER BY valid_until ASC"
        );

        if (!$stmt) {
            return [];
        }

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
     * Retrieves a voucher by its unique code.
     *
     * @param string $code Voucher code
     * @return Voucher|null Voucher object if found, null otherwise
     */
    public function getVoucherByCode(string $code): ?Voucher
    {
        $stmt = $this->db->prepare(
            "SELECT id,
                    code,
                    value,
                    remaining_value,
                    valid_until,
                    redeemed,
                    user_id
             FROM vouchers
             WHERE code = ?
             LIMIT 1"
        );

        if (!$stmt) {
            return null;
        }

        $stmt->bind_param("s", $code);
        $stmt->execute();

        $row = $stmt
            ->get_result()
            ->fetch_assoc();

        return $row ? new Voucher($row) : null;
    }

    /**
     * Redeems a voucher against a cart total and updates its remaining value.
     * Marks the voucher as redeemed if the remaining value reaches zero.
     *
     * @param Voucher $voucher Voucher to redeem
     * @param float $cartTotal Cart total before voucher discount
     * @return float Final amount after applying the available voucher value
     */
    public function redeemVoucher(Voucher $voucher, float $cartTotal): float
    {
        $discount = min($voucher->remaining_value, $cartTotal);
        $newRemaining = $voucher->remaining_value - $discount;
        $newTotal = $cartTotal - $discount;
        $redeemed = $newRemaining <= 0 ? 1 : 0;

        $stmt = $this->db->prepare(
            "UPDATE vouchers
             SET remaining_value = ?,
                 redeemed = ?
             WHERE id = ?"
        );

        if (!$stmt) {
            return $cartTotal;
        }

        $stmt->bind_param(
            "dii",
            $newRemaining,
            $redeemed,
            $voucher->id
        );

        $stmt->execute();

        return $newTotal;
    }

    /**
     * Assigns a voucher to a specific user.
     *
     * @param Voucher $voucher Voucher to assign
     * @param int $userId User identifier
     * @return bool True if the voucher was assigned successfully
     */
    public function assignVoucherToUser(Voucher $voucher, int $userId): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE vouchers
             SET user_id = ?
             WHERE id = ?"
        );

        if (!$stmt) {
            return false;
        }

        $stmt->bind_param(
            "ii",
            $userId,
            $voucher->id
        );

        return $stmt->execute() && $stmt->affected_rows > 0;
    }
}