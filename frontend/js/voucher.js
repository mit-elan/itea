"use strict";
function fetchVouchers(role) {
    const method = role === "admin" ? "getAll" : "getByUserId";
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/itea/backend/serviceHandler.php?handler=vouchers&method=${method}`,
            type: "GET",
            dataType: "json",
            success: resolve,
            error: reject,
        });
    });
}
function renderVoucherTable(vouchers) {
    const $tableBody = $("#voucher-table-body");
    $tableBody.empty();
    if (vouchers.length === 0) {
        $("#voucher-table-card").addClass("d-none");
        $("#voucher-empty").removeClass("d-none");
        return;
    }
    $("#voucher-empty").addClass("d-none");
    $("#voucher-table-card").removeClass("d-none");
    vouchers.forEach((voucher) => {
        const $row = $($("#voucher-row-template").html() || "").clone();
        $row.find(".voucher-code").text(voucher.code);
        $row.find(".voucher-value").text(`€ ${voucher.value.toFixed(2)}`);
        $row.find(".voucher-remaining-value").text(`€ ${voucher.remainingValue.toFixed(2)}`);
        $row.find(".voucher-date").text(new Date(voucher.expiryDate).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }));
        const $badge = $row.find(".voucher-status");
        if (voucher.status === "active") {
            $badge.text("Active").addClass("bg-success");
        }
        else if (voucher.status === "redeemed") {
            $badge.text("Redeemed").addClass("bg-secondary");
        }
        else {
            $badge.text("Expired").addClass("bg-danger");
        }
        $tableBody.append($row);
    });
}
$(function () {
    checkLoginStatus().then(function (response) {
        const userRole = response.role;
        fetchVouchers(userRole)
            .then((vouchers) => renderVoucherTable(vouchers))
            .catch((err) => console.error("Error loading vouchers", err));
        $("#create-voucher-form").on("submit", function (e) {
            e.preventDefault();
            $("#voucher-error").text("").addClass("d-none");
            const value = parseFloat($("#voucher-value").val());
            const validUntil = $("#voucher-valid-until").val();
            if (isNaN(value) || value <= 0) {
                $("#voucher-error")
                    .text("Please enter a valid voucher value greater than 0.")
                    .removeClass("d-none");
                return;
            }
            if (!validUntil) {
                $("#voucher-error")
                    .text("Please select a valid expiration date.")
                    .removeClass("d-none");
                return;
            }
            if (new Date(validUntil) <= new Date()) {
                $("#voucher-error")
                    .text("The expiry date must be in the future.")
                    .removeClass("d-none");
                return;
            }
            $.ajax({
                url: "/itea/backend/serviceHandler.php?handler=vouchers&method=create",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ value, validUntil }),
                success: function (response) {
                    if (response.error) {
                        $("#voucher-error").text(response.error).removeClass("d-none");
                        return;
                    }
                    fetchVouchers(userRole)
                        .then((vouchers) => renderVoucherTable(vouchers))
                        .catch((err) => console.error("Error loading vouchers", err));
                },
                error: function (err) {
                    console.error("Error creating voucher:", err);
                    $("#voucher-error")
                        .text("An unexpected error occurred. Please try again.")
                        .removeClass("d-none");
                },
            });
        });
        $("#voucher-form").on("submit", function (e) {
            e.preventDefault();
            $("#voucher-error").text("").addClass("d-none");
            const code = $("#voucher-code").val().trim().toUpperCase();
            if (!code) {
                $("#voucher-error")
                    .text("Please enter a voucher code.")
                    .removeClass("d-none");
                return;
            }
            $.ajax({
                url: "/itea/backend/serviceHandler.php?handler=vouchers&method=addToProfile",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ code }),
                success: function () {
                    fetchVouchers(userRole)
                        .then((vouchers) => renderVoucherTable(vouchers))
                        .catch((err) => console.error("Error loading vouchers", err));
                },
                error: function (xhr) {
                    var _a;
                    const msg = ((_a = xhr.responseJSON) === null || _a === void 0 ? void 0 : _a.error) || "An unexpected error occurred.";
                    $("#voucher-error").text(msg).removeClass("d-none");
                },
            });
        });
    });
});
