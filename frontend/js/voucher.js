"use strict";
/**
 * Voucher page logic
 * Loads vouchers based on user role, renders the voucher table,
 * and handles voucher creation or voucher assignment to a customer profile.
 */
$(function () {
    checkLoginStatus().then(function (response) {
        var _a;
        const userRole = (_a = response.role) !== null && _a !== void 0 ? _a : "guest";
        loadAndRenderVouchers(userRole);
        $("#create-voucher-form").on("submit", function (event) {
            event.preventDefault();
            createVoucher(userRole);
        });
        $("#voucher-form").on("submit", function (event) {
            event.preventDefault();
            addVoucherToProfile(userRole);
        });
    });
});
function fetchVouchers(role) {
    const method = role === "admin" ? "getAll" : "getByUserId";
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: `/itea/backend/serviceHandler.php?handler=vouchers&method=${method}`,
            type: "GET",
            dataType: "json",
            success: function (response) {
                if (isVoucherBackendErrorResponse(response)) {
                    reject(response.error);
                    return;
                }
                resolve(response);
            },
            error: function (xhr) {
                reject(getVoucherBackendError(xhr));
            },
        });
    });
}
function loadAndRenderVouchers(userRole) {
    fetchVouchers(userRole)
        .then(function (vouchers) {
        renderVoucherTable(vouchers);
    })
        .catch(function (error) {
        console.error("Error loading vouchers:", error);
        showVoucherError("Failed to load vouchers.");
    });
}
function renderVoucherTable(vouchers) {
    const tableBody = $("#voucher-table-body");
    tableBody.empty();
    if (vouchers.length === 0) {
        $("#voucher-table-card").addClass("d-none");
        $("#voucher-empty").removeClass("d-none");
        return;
    }
    $("#voucher-empty").addClass("d-none");
    $("#voucher-table-card").removeClass("d-none");
    vouchers.forEach(function (voucher) {
        tableBody.append(createVoucherRow(voucher));
    });
}
function createVoucherRow(voucher) {
    const row = cloneVoucherTemplate("voucher-row-template");
    row.find(".voucher-code").text(voucher.code);
    row.find(".voucher-value").text(formatVoucherCurrency(voucher.value));
    row
        .find(".voucher-remaining-value")
        .text(formatVoucherCurrency(voucher.remainingValue));
    row.find(".voucher-date").text(formatVoucherDate(voucher.expiryDate));
    row
        .find(".voucher-assigned-user")
        .text(voucher.userId ? `${voucher.userId}` : "Unassigned");
    renderVoucherStatusBadge(row, voucher.status);
    return row;
}
function renderVoucherStatusBadge(row, status) {
    const badge = row.find(".voucher-status");
    badge.removeClass("bg-success bg-secondary bg-danger");
    if (status === "active") {
        badge.text("Active").addClass("bg-success");
        return;
    }
    if (status === "redeemed") {
        badge.text("Redeemed").addClass("bg-secondary");
        return;
    }
    badge.text("Expired").addClass("bg-danger");
}
function createVoucher(userRole) {
    var _a, _b;
    clearVoucherMessages();
    const value = parseFloat(String((_a = $("#voucher-value").val()) !== null && _a !== void 0 ? _a : ""));
    const validUntil = String((_b = $("#voucher-valid-until").val()) !== null && _b !== void 0 ? _b : "");
    if (isNaN(value) || value <= 0) {
        showVoucherError("Please enter a valid voucher value greater than 0.");
        return;
    }
    if (!validUntil) {
        showVoucherError("Please select a valid expiration date.");
        return;
    }
    if (new Date(validUntil) <= new Date()) {
        showVoucherError("The expiry date must be in the future.");
        return;
    }
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=vouchers&method=create",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ value, validUntil }),
        success: function (response) {
            var _a;
            if (response.error) {
                showVoucherError(response.error);
                return;
            }
            showVoucherSuccess(`Voucher ${(_a = response.voucherCode) !== null && _a !== void 0 ? _a : ""} created successfully!`);
            loadAndRenderVouchers(userRole);
        },
        // Try to read the backend error message. If no defined response is available, show generic error message.
        error: function (xhr) {
            showVoucherError(getVoucherBackendError(xhr));
        },
    });
}
function addVoucherToProfile(userRole) {
    var _a;
    clearVoucherMessages();
    const code = String((_a = $("#voucher-code").val()) !== null && _a !== void 0 ? _a : "").trim().toUpperCase();
    if (!code) {
        showVoucherError("Please enter a voucher code.");
        return;
    }
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=vouchers&method=addToProfile",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ code }),
        success: function (response) {
            var _a;
            if (response.error) {
                showVoucherError(response.error);
                return;
            }
            showVoucherSuccess(`Voucher ${(_a = response.voucherCode) !== null && _a !== void 0 ? _a : code} added to profile successfully!`);
            loadAndRenderVouchers(userRole);
        },
        error: function (xhr) {
            showVoucherError(getVoucherBackendError(xhr));
        },
    });
}
function cloneVoucherTemplate(templateId) {
    const template = document.getElementById(templateId);
    const templateElement = template === null || template === void 0 ? void 0 : template.content.firstElementChild;
    if (!templateElement) {
        return $();
    }
    return $(templateElement.cloneNode(true));
}
function formatVoucherCurrency(value) {
    return `€ ${Number(value !== null && value !== void 0 ? value : 0).toFixed(2)}`;
}
function formatVoucherDate(dateString) {
    return new Date(dateString).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}
function clearVoucherMessages() {
    $("#voucher-error").text("").addClass("d-none");
    $("#voucher-success").text("").addClass("d-none");
}
function showVoucherError(message) {
    $("#voucher-error").text(message).removeClass("d-none");
}
function showVoucherSuccess(message) {
    $("#voucher-success").text(message).removeClass("d-none");
}
function isVoucherBackendErrorResponse(response) {
    return (typeof response === "object" &&
        response !== null &&
        "error" in response &&
        typeof response.error === "string");
}
// Extracts error message from AJAX response, handling various response formats
function getVoucherBackendError(xhr) {
    const fallback = "An unexpected error occurred.";
    try {
        return JSON.parse(xhr.responseText).error || fallback;
    }
    catch (_a) {
        return xhr.responseText || fallback;
    }
}
