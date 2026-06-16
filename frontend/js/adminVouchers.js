"use strict";
/**
 * Admin voucher management page logic
 * Protects the admin voucher management page so only admin users can access it.
 * Loads all vouchers, renders the voucher table, and handles voucher creation.
 */
$(document).ready(function () {
    requireRole("admin", function () {
        loadAdminVouchers();
        $("#create-voucher-form").on("submit", function (event) {
            event.preventDefault();
            createAdminVoucher();
        });
    });
});
function loadAdminVouchers() {
    $.ajax({
        url: `/itea/backend/serviceHandler.php?handler=vouchers&method=getAll`,
        type: "GET",
        dataType: "json",
        success: function (response) {
            renderAdminVoucherTable(response.vouchers);
        },
        error: function (xhr) {
            console.error("Error loading vouchers:", xhr);
            showAdminVoucherError("Failed to load vouchers.");
        },
    });
}
function renderAdminVoucherTable(vouchers) {
    const tableBody = $("#voucher-table-body");
    tableBody.empty();
    if (vouchers.length === 0) {
        return;
    }
    vouchers.forEach(function (voucher) {
        const template = document.getElementById("voucher-row-template");
        const rowClone = $(template.content.cloneNode(true)).children();
        rowClone.find(".voucher-code").text(voucher.code);
        rowClone.find(".voucher-value").text(`€ ${Number(voucher.value).toFixed(2)}`);
        rowClone.find(".voucher-remaining-value").text(`€ ${Number(voucher.remainingValue).toFixed(2)}`);
        rowClone.find(".voucher-date").text(new Date(voucher.expiryDate).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }));
        rowClone.find(".voucher-assigned-user").text(voucher.userId ? `${voucher.userId}` : "Unassigned");
        const badge = rowClone.find(".voucher-status");
        badge.removeClass("bg-success bg-secondary bg-danger");
        if (voucher.status === "active") {
            badge.text("Active").addClass("bg-success");
        }
        else if (voucher.status === "redeemed") {
            badge.text("Redeemed").addClass("bg-secondary");
        }
        else {
            badge.text("Expired").addClass("bg-danger");
        }
        tableBody.append(rowClone);
    });
}
function createAdminVoucher() {
    var _a, _b;
    clearAdminVoucherMessages();
    const value = parseFloat(String((_a = $("#voucher-value").val()) !== null && _a !== void 0 ? _a : ""));
    const validUntil = String((_b = $("#voucher-valid-until").val()) !== null && _b !== void 0 ? _b : "");
    if (isNaN(value) || value <= 0) {
        showAdminVoucherError("Please enter a valid voucher value greater than 0.");
        return;
    }
    if (!validUntil) {
        showAdminVoucherError("Please select a valid expiration date.");
        return;
    }
    if (new Date(validUntil) <= new Date()) {
        showAdminVoucherError("The expiry date must be in the future.");
        return;
    }
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=vouchers&method=create",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ value, validUntil }),
        success: function (response) {
            showAdminVoucherSuccess(`Voucher ${response.voucherCode} created successfully!`);
            loadAdminVouchers();
            $("#create-voucher-form")[0].reset();
        },
        error: function (xhr) {
            showAdminVoucherError(getAdminErrorMessage(xhr));
        },
    });
}
function clearAdminVoucherMessages() {
    $("#voucher-error").text("").addClass("d-none");
    $("#voucher-success").text("").addClass("d-none");
}
function showAdminVoucherError(message) {
    $("#voucher-error").text(message).removeClass("d-none");
}
function showAdminVoucherSuccess(message) {
    $("#voucher-success").text(message).removeClass("d-none");
}
function getAdminErrorMessage(xhr) {
    var _a;
    try {
        const response = JSON.parse(xhr.responseText);
        return (_a = response.error) !== null && _a !== void 0 ? _a : "An unexpected error occurred.";
    }
    catch (_b) {
        return "An unexpected error occurred.";
    }
}
