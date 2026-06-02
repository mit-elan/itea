"use strict";
$(document).ready(function () {
    let userId = null;
    let appliedVoucherCode = null;
    checkLoginStatus().then(function (response) {
        updateNavigation(response);
        if (response.loggedIn && response.role === "customer") {
            userId = response.userId;
            loadCart();
            loadPaymentMethods();
            loadSavedVouchers();
        }
    });
    function applyVoucher(code) {
        $("#checkout-voucher-error").text("").addClass("d-none");
        const cartAmount = parseFloat($("#subtotal-value").text().replace("€", ""));
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=vouchers&method=apply",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ code, cartAmount }),
            success: function (response) {
                appliedVoucherCode = code;
                $("#voucher-value").text(`- €${Number(response.discount).toFixed(2)}`);
                $("#voucher-row").removeClass("d-none").addClass("d-flex");
                $("#total-value").text(`€${Number(response.finalAmount).toFixed(2)}`);
            },
            error: function (xhr) {
                var _a;
                const msg = ((_a = xhr.responseJSON) === null || _a === void 0 ? void 0 : _a.error) || "Unknown error";
                $("#checkout-voucher-error").text(msg).removeClass("d-none");
                $("input[name='voucher_selection']").prop("checked", false);
            },
        });
    }
    $("#apply-voucher-button").on("click", function () {
        const code = $(".cart-voucher-input").val().trim().toUpperCase();
        if (!code) {
            $("#checkout-voucher-error").text("Please enter a voucher code.").removeClass("d-none");
            return;
        }
        applyVoucher(code);
    });
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
            error: function (err) {
                console.error("Error loading cart: ", err);
                alert("Failed to load cart.");
            },
        });
    }
    function renderCart(cartItems) {
        const $cartContainer = $("#cart-items-container");
        $cartContainer.empty();
        if (!cartItems || cartItems.length === 0) {
            $cartContainer.append("<p class='text-center'>Your cart is empty.</p>");
            return;
        }
        const itemTemplate = document.getElementById("checkout-item-template");
        let total = 0;
        cartItems.forEach(function (item) {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            const $item = $(document.importNode(itemTemplate.content, true)
                .firstElementChild);
            $item
                .find(".cart-item-image")
                .attr("src", `/itea/backend/productpictures/${item.file_path}`)
                .attr("alt", item.name);
            $item.find(".cart-item-title").text(item.name);
            $item.find(".cart-item-quantity").text(`100g x ${item.quantity}`);
            $item.find(".cart-item-subtotal").text(`€${Number(subtotal).toFixed(2)}`);
            $cartContainer.append($item);
        });
        // Nach der Schleife einmal setzen
        $("#subtotal-value").text("€" + total.toFixed(2));
        $("#total-value").text("€" + total.toFixed(2));
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
            error: function (err) {
                console.error("Error loading payment methods: ", err);
                alert("Failed to load payment methods.");
            },
        });
    }
    function renderPaymentMethods(paymentMethods) {
        const $paymentContainer = $("#payment-methods-container");
        $paymentContainer.empty();
        if (!paymentMethods || paymentMethods.length === 0) {
            $paymentContainer.append("<p class='text-center'>No saved payment methods found.</p>");
            return;
        }
        const paymentTemplate = document.getElementById("payment-method-template");
        paymentMethods.forEach(function (method, index) {
            const last4 = method.card_number.slice(-4);
            const isBankAccount = method.is_bank_account;
            const inputId = `pay${index}`;
            const typeLabel = isBankAccount ? "Bank Transfer (IBAN)" : "Credit Card";
            const subLabel = isBankAccount
                ? "DE XXXX XXXX XXXX " + last4
                : "Card ending in " + last4;
            const $method = $(document.importNode(paymentTemplate.content, true)
                .firstElementChild);
            $method
                .find("input")
                .attr("id", inputId)
                .attr("value", String(method.id))
                .prop("checked", index === 0);
            $method.find("label").attr("for", inputId);
            $method
                .find(".payment-type-label")
                .text(`${method.label} - ${typeLabel}`);
            $method.find(".payment-sub-label").text(subLabel);
            $paymentContainer.append($method);
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
            error: function (err) {
                console.error("Error loading saved vouchers", err);
            },
        });
    }
    function renderCheckoutVouchers(vouchers) {
        const activeVouchers = vouchers.filter((v) => v.status === "active");
        if (activeVouchers.length === 0) {
            $("#saved-vouchers-section").addClass("d-none");
            return;
        }
        $("#saved-vouchers-section").removeClass("d-none");
        const $container = $("#saved-vouchers-container");
        $container.empty();
        const voucherTemplate = document.getElementById("voucher-selection-template");
        activeVouchers.forEach((voucher) => {
            const inputId = `voucher-${voucher.code}`;
            const $item = $(document.importNode(voucherTemplate.content, true)
                .firstElementChild);
            $item.find("input").attr("id", inputId).attr("value", voucher.code);
            $item.find("label").attr("for", inputId);
            $item.find(".voucher-code-label").text(voucher.code);
            $item.find(".voucher-expiry-label").text(`Expires: ${new Date(voucher.expiryDate).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })}`);
            $item
                .find(".voucher-amount-label")
                .text(`€ ${voucher.remainingValue.toFixed(2)}`);
            $container.append($item);
        });
        $container.on("change", "input[name='voucher_selection']", function () {
            applyVoucher($(this).val());
        });
    }
    $("#remove-voucher").on("click", function () {
        appliedVoucherCode = null;
        $("input[name='voucher_selection']").prop("checked", false);
        $("#voucher-row").addClass("d-none").removeClass("d-flex");
        $("#checkout-voucher-error").text("").addClass("d-none");
        $("#total-value").text($("#subtotal-value").text());
    });
    $("#order-button").on("click", function (e) {
        e.preventDefault();
        placeOrder();
    });
    function placeOrder() {
        $("#checkout-order-error").text("").addClass("d-none");
        const paymentMethodId = $("input[name='payment']:checked").val();
        if (!paymentMethodId) {
            $("#checkout-order-error").text("Please select a payment method.").removeClass("d-none");
            return;
        }
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=orders&method=placeOrder",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ userId, paymentMethodId, appliedVoucherCode }),
            success: function (response) {
                if (response.error) {
                    $("#checkout-order-error").text(response.error).removeClass("d-none");
                    return;
                }
                window.location.href =
                    "/itea/frontend/sites/order-details.php?id=" +
                        response.orderId +
                        "&success=1";
            },
            error: function (err) {
                console.error("Error placing order: ", err);
            },
        });
    }
});
