"use strict";
$(document).ready(function () {
    let userId = null;
    let userIsAllowed = false;
    checkLoginStatus().then(function (response) {
        updateNavigation(response);
        if (response.loggedIn && response.role === "customer") {
            userId = response.userId;
            userIsAllowed = true;
            loadCart();
            loadPaymentMethods();
        }
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
    $("#order-button").on("click", function (e) {
        e.preventDefault();
        placeOrder();
    });
    function placeOrder() {
        const paymentMethodId = $("input[name='payment']:checked").val();
        if (!paymentMethodId) {
            alert("Please select a payment method.");
            return;
        }
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=orders&method=placeOrder",
            type: "POST",
            data: { userId, paymentMethodId },
            success: function (response) {
                if (response.error) {
                    alert("Failed to place order: " + response.error);
                    return;
                }
                window.location.href =
                    "/itea/frontend/sites/order-details.php?id=" +
                        response.orderId +
                        "&success=1";
            },
            error: function (err) {
                console.error("Error placing order: ", err);
                alert("Failed to place order.");
            },
        });
    }
});
