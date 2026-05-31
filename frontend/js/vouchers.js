"use strict";
$(document).ready(function () {
    loadVouchers();
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
                loadVouchers();
            },
            error: function (err) {
                console.error("Error creating voucher:", err);
                $("#voucher-error")
                    .text("An unexpected error occurred. Please try again.")
                    .removeClass("d-none");
            },
        });
    });
    function loadVouchers() {
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=vouchers&method=getAll",
            type: "GET",
            dataType: "json",
            success: function (vouchers) {
                const $tableBody = $("#voucher-table-body");
                $tableBody.empty();
                if (vouchers.length === 0) {
                    $tableBody.append(`<tr><td colspan="4" class="text-center py-4">No vouchers found.</td></tr>`);
                    return;
                }
                vouchers.forEach((voucher) => {
                    const $row = $($("#voucher-row-template").html() || "").clone();
                    $row.find(".voucher-code").text(voucher.code);
                    $row.find(".voucher-value").text(`€ ${voucher.value.toFixed(2)}`);
                    $row
                        .find(".voucher-remaining-value")
                        .text(`€ ${voucher.remainingValue.toFixed(2)}`);
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
            },
            error: function (err) {
                console.error("Error loading vouchers", err);
            },
        });
    }
});
