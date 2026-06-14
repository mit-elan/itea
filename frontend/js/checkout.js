"use strict";
/**
 * Checkout page logic
 * Loads the cart, saved payment methods and vouchers,
 * applies vouchers and places the final order.
 */
$(document).ready(function () {
    let userId = null;
    let appliedVoucherCode = null;
    checkLoginStatus().then(function (response) {
        updateNavigation(response);
        if (!response.loggedIn || response.role !== "customer") {
            window.location.href = "/itea/frontend/sites/login.html";
            return;
        }
        userId = response.userId;
        loadCart();
        loadPaymentMethods();
        loadSavedVouchers();
    });
    $("#apply-voucher-button").on("click", function () {
        const code = getCheckoutInputValue(".cart-voucher-input")
            .trim()
            .toUpperCase();
        if (!code) {
            $("#checkout-voucher-error")
                .text("Please enter a voucher code.")
                .removeClass("d-none");
            return;
        }
        $("input[name='voucher_selection']").prop("checked", false);
        applyVoucher(code);
    });
    $("#remove-voucher").on("click", function () {
        appliedVoucherCode = null;
        $("input[name='voucher_selection']").prop("checked", false);
        $("#voucher-row").addClass("d-none").removeClass("d-flex");
        $("#checkout-voucher-error").text("").addClass("d-none");
        $("#total-value").text($("#subtotal-value").text());
    });
    $("#order-button").on("click", function (event) {
        event.preventDefault();
        placeOrder();
    });
    function applyVoucher(code) {
        $("#checkout-voucher-error").text("").addClass("d-none");
        const cartAmount = parseFloat($("#subtotal-value").text().replace("€", ""));
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=vouchers&method=apply",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({ code, cartAmount }),
            success: function (response) {
                if (response.error) {
                    $("#checkout-voucher-error")
                        .text(response.error)
                        .removeClass("d-none");
                    return;
                }
                appliedVoucherCode = code;
                $("#voucher-value").text(formatCheckoutDiscount(response.discount));
                $("#voucher-row").removeClass("d-none").addClass("d-flex");
                $("#total-value").text(formatCheckoutCurrency(response.finalAmount));
            },
            error: function (xhr) {
                $("#checkout-voucher-error")
                    .text(getCheckoutBackendError(xhr))
                    .removeClass("d-none");
            },
        });
    }
    function loadCart() {
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=cart&method=loadCart&userId=" +
                userId,
            type: "GET",
            dataType: "json",
            success: function (response) {
                if (response.error) {
                    alert("Failed to load cart: " + response.error);
                    return;
                }
                renderCart(response.cartItems);
            },
            error: function (xhr) {
                console.error("Error loading cart:", getCheckoutBackendError(xhr));
                alert("Failed to load cart.");
            },
        });
    }
    function renderCart(cartItems) {
        const cartContainer = $("#cart-items-container");
        cartContainer.empty();
        if (!cartItems || cartItems.length === 0) {
            cartContainer.append($("<p>")
                .addClass("text-center")
                .text("Your cart is empty."));
            return;
        }
        const itemTemplate = document.getElementById("checkout-item-template");
        const itemTemplateElement = itemTemplate === null || itemTemplate === void 0 ? void 0 : itemTemplate.content.firstElementChild;
        if (!itemTemplateElement) {
            alert("Checkout item template could not be loaded.");
            return;
        }
        let total = 0;
        cartItems.forEach(function (item) {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            const cartItem = $(itemTemplateElement.cloneNode(true));
            cartItem
                .find(".cart-item-image")
                .attr("src", `/itea/backend/productpictures/${item.file_path}`)
                .attr("alt", item.name);
            cartItem.find(".cart-item-title").text(item.name);
            cartItem.find(".cart-item-quantity").text(`100g x ${item.quantity}`);
            cartItem
                .find(".cart-item-subtotal")
                .text(formatCheckoutCurrency(subtotal));
            cartContainer.append(cartItem);
        });
        // Set subtotal and total after all cart items have been rendered
        $("#subtotal-value").text(formatCheckoutCurrency(total));
        $("#total-value").text(formatCheckoutCurrency(total));
    }
    function loadPaymentMethods() {
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=payment&method=getByUserId&userId=" +
                userId,
            type: "GET",
            dataType: "json",
            success: function (response) {
                if (response.error) {
                    alert("Failed to load payment methods: " + response.error);
                    return;
                }
                renderPaymentMethods(response.paymentMethods);
            },
            error: function (xhr) {
                console.error("Error loading payment methods:", getCheckoutBackendError(xhr));
                alert("Failed to load payment methods.");
            },
        });
    }
    function renderPaymentMethods(paymentMethods) {
        const paymentContainer = $("#payment-methods-container");
        paymentContainer.empty();
        if (!paymentMethods || paymentMethods.length === 0) {
            paymentContainer.append($("<p>")
                .addClass("text-center")
                .text("No saved payment methods found."));
            return;
        }
        const paymentTemplate = document.getElementById("payment-method-template");
        const paymentTemplateElement = paymentTemplate === null || paymentTemplate === void 0 ? void 0 : paymentTemplate.content.firstElementChild;
        if (!paymentTemplateElement) {
            alert("Payment method template could not be loaded.");
            return;
        }
        paymentMethods.forEach(function (method, index) {
            const last4 = method.card_number.slice(-4);
            const isBankAccount = method.is_bank_account === 1;
            const inputId = `pay${index}`;
            const typeLabel = isBankAccount ? "Bank Transfer (IBAN)" : "Credit Card";
            const subLabel = isBankAccount
                ? "DE XXXX XXXX XXXX " + last4
                : "Card ending in " + last4;
            const paymentMethod = $(paymentTemplateElement.cloneNode(true));
            paymentMethod
                .find("input")
                .attr("id", inputId)
                .attr("value", String(method.id))
                .prop("checked", index === 0);
            paymentMethod.find("label").attr("for", inputId);
            paymentMethod
                .find(".payment-type-label")
                .text(`${method.label} - ${typeLabel}`);
            paymentMethod.find(".payment-sub-label").text(subLabel);
            paymentContainer.append(paymentMethod);
        });
    }
    function loadSavedVouchers() {
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=vouchers&method=getByUserId",
            type: "GET",
            dataType: "json",
            success: function (vouchers) {
                renderCheckoutVouchers(vouchers);
            },
            error: function (xhr) {
                console.error("Error loading saved vouchers:", getCheckoutBackendError(xhr));
            },
        });
    }
    function renderCheckoutVouchers(vouchers) {
        const activeVouchers = vouchers.filter(function (voucher) {
            return voucher.status === "active";
        });
        if (activeVouchers.length === 0) {
            $("#saved-vouchers-section").addClass("d-none");
            return;
        }
        $("#saved-vouchers-section").removeClass("d-none");
        const container = $("#saved-vouchers-container");
        container.empty();
        const voucherTemplate = document.getElementById("voucher-selection-template");
        const voucherTemplateElement = voucherTemplate === null || voucherTemplate === void 0 ? void 0 : voucherTemplate.content.firstElementChild;
        if (!voucherTemplateElement) {
            console.error("Voucher selection template could not be loaded.");
            return;
        }
        activeVouchers.forEach(function (voucher) {
            const inputId = `voucher-${voucher.code}`;
            const voucherItem = $(voucherTemplateElement.cloneNode(true));
            voucherItem.find("input").attr("id", inputId).attr("value", voucher.code);
            voucherItem.find("label").attr("for", inputId);
            voucherItem.find(".voucher-code-label").text(voucher.code);
            voucherItem.find(".voucher-expiry-label").text(`Expires: ${new Date(voucher.expiryDate).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })}`);
            voucherItem
                .find(".voucher-amount-label")
                .text(formatCheckoutCurrency(voucher.remainingValue));
            container.append(voucherItem);
        });
        container.off("change", "input[name='voucher_selection']");
        container.on("change", "input[name='voucher_selection']", function () {
            $(".cart-voucher-input").val("");
            $("#checkout-voucher-error").text("").addClass("d-none");
            applyVoucher(String($(this).val()));
        });
    }
    function placeOrder() {
        $("#checkout-order-error").text("").addClass("d-none");
        const paymentMethodId = $("input[name='payment']:checked").val();
        if (!paymentMethodId) {
            $("#checkout-order-error")
                .text("Please select a payment method.")
                .removeClass("d-none");
            return;
        }
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=orders&method=placeOrder",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                userId,
                paymentMethodId,
                appliedVoucherCode,
            }),
            success: function (response) {
                var _a;
                if (response.error || !response.orderId) {
                    $("#checkout-order-error")
                        .text((_a = response.error) !== null && _a !== void 0 ? _a : "Order could not be placed.")
                        .removeClass("d-none");
                    return;
                }
                window.location.href =
                    "/itea/frontend/sites/orderDetails.html?id=" +
                        response.orderId +
                        "&success=1";
            },
            error: function (xhr) {
                console.error("Error placing order:", getCheckoutBackendError(xhr));
                $("#checkout-order-error")
                    .text(getCheckoutBackendError(xhr))
                    .removeClass("d-none");
            },
        });
    }
    function getCheckoutInputValue(selector) {
        const value = $(selector).val();
        return typeof value === "string" ? value : "";
    }
    function formatCheckoutCurrency(value) {
        return `€${Number(value !== null && value !== void 0 ? value : 0).toFixed(2)}`;
    }
    function formatCheckoutDiscount(value) {
        return `- ${formatCheckoutCurrency(value)}`;
    }
    function getCheckoutBackendError(xhr) {
        var _a;
        const fallbackMessage = "Unknown error";
        if (!xhr.responseText) {
            return fallbackMessage;
        }
        try {
            const response = JSON.parse(xhr.responseText);
            return (_a = response.error) !== null && _a !== void 0 ? _a : fallbackMessage;
        }
        catch (_b) {
            return xhr.responseText;
        }
    }
});
