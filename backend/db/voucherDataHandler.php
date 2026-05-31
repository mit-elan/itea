<?php

require_once __DIR__ . '/dbaccess.php';
require_once __DIR__ . '/../models/voucher.class.php';

class VoucherDataHandler
{
    private mysqli $db;

    public function __construct(DBaccess $db)
    {
        $this->db = $db->getConnection();
    }


    public function createVoucher(Voucher $voucher): bool
    {
        // remaining_value ist bei Erstellung immer gleich value
        $stmt = $this->db->prepare(
            "INSERT INTO vouchers (code, value, remaining_value, valid_until) VALUES (?, ?, ?, ?)"
        );
        if (!$stmt) return false;
        $stmt->bind_param("sdds", $voucher->code, $voucher->value, $voucher->value, $voucher->valid_until);
        return $stmt->execute();
    }

    /** @return Voucher[] */
    public function getVouchers(): array
    {
        $result = $this->db->query(
            "SELECT id, code, value, remaining_value, valid_until, redeemed FROM vouchers ORDER BY valid_until DESC"
        );
        if (!$result) return [];

        $vouchers = [];
        while ($row = $result->fetch_assoc()) {
            $vouchers[] = new Voucher($row);
        }
        return $vouchers;
    }

    public function getVoucherByCode(string $code): ?Voucher
    {
        $stmt = $this->db->prepare(
            "SELECT id, code, value, remaining_value, valid_until, redeemed FROM vouchers WHERE code = ?"
        );
        if (!$stmt) return null;
        $stmt->bind_param("s", $code);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        return $row ? new Voucher($row) : null;
    }


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
}
