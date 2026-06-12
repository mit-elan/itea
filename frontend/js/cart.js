"use strict";
/**
 * cart.ts – Warenkorb-Logik (Session-basiert, kein Page-Reload)
 * Sprint 2: SCRUM-60, SCRUM-57
 */
function addToCart(productId, quantity) {
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=cart&method=addToCart",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ productId, quantity }),
        success: function (response) {
            if (response.error) {
                alert("Failed to add product to cart.");
                return;
            }
            $("#cart-count").text(response.cartCount);
        },
        error: function (err) {
            console.error("Error adding to cart: ", err);
            alert("Failed to add product to cart.");
        },
    });
}
function addToCartViaDrag(productId, onSuccess, onError) {
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=cart&method=addToCart",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ productId: productId, quantity: 1 }),
        success: function (response) {
            $("#cart-count").text(response.cartCount);
            if (onSuccess)
                onSuccess();
        },
        error: function (jqXHR) {
            let errorMessage = "Failed to add product to cart.";
            try {
                const response = JSON.parse(jqXHR.responseText);
                if (response.error) {
                    errorMessage = response.error;
                }
            }
            catch (e) {
                // Response was not JSON, keep default error message
            }
            console.error("Cart error:", errorMessage);
            if (onError)
                onError();
        },
    });
}
window.addToCartViaDrag = addToCartViaDrag;
// Tracks guest status to conditionally show login prompt vs. checkout
let isGuest = false;
$(document).ready(function () {
    checkLoginStatus().then(function (response) {
        updateNavigation(response);
        isGuest = response.role === "guest";
        loadCart();
        if (isGuest) {
            $("#checkout-button")
                .text("Log in to proceed")
                .attr("href", "/itea/frontend/sites/login.php");
        }
    });
    //Produkt in Produktansicht zu Warenkorb hinzufügen
    $(document).on("click", ".button-addToCartList", function (event) {
        event.preventDefault();
        const productId = Number($(this).data("id"));
        addToCart(productId, 1);
    });
    //Product in Detailansicht zu Warenkorb hinzufügen (inkl. Custom Quantity)
    $("#button-addToCartDetail").on("click", function (e) {
        e.preventDefault();
        const productId = Number($(this).data("id"));
        const quantity = parseInt($("#quantity-input").val()) || 1;
        if (quantity <= 0) {
            alert("Please insert a valid number of Products");
            return false;
        }
        addToCart(productId, quantity);
    });
    function updateCart(productId, quantity) {
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=cart&method=updateCart",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({ productId, quantity }),
            success: function (response) {
                if (response.error) {
                    alert("Failed to update cart.");
                    return;
                }
                $("#cart-count").text(response.cartCount);
                // Reload entire cart to sync subtotals and total price after quantity change
                loadCart();
            },
            error: function (err) {
                console.error("Error updating cart: ", err);
                alert("Failed to update cart.");
            },
        });
    }
    function loadCart() {
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=cart&method=loadCart",
            type: "GET",
            dataType: "json",
            success: function (response) {
                if (response.error) {
                    $("#cart-error").text(response.error).removeClass("d-none").show();
                    return;
                }
                // Clear any previous errors on successful load
                $("#cart-error").hide().text("");
                renderCart(response.cartItems);
            },
            error: function (xhr) {
                let message = "Failed to load cart. Please try again.";
                try {
                    const res = JSON.parse(xhr.responseText);
                    if (res.error) {
                        message = res.error;
                    }
                }
                catch (e) {
                    // If response is not JSON, use default message
                }
                $("#cart-error").text(message).removeClass("d-none").show();
                console.error("Error loading cart: ", xhr);
            },
        });
    }
    function renderCart(cartItems) {
        const $cartContainer = $("#cart-items-container");
        $cartContainer.empty();
        if (!cartItems || cartItems.length === 0) {
            $cartContainer.append("<p class='text-center'>Your cart is empty.</p>");
            $("#subtotal-value").text("€0.00");
            if (isGuest) {
                $("#checkout-button")
                    .text("Log in to proceed")
                    .attr("href", "/itea/frontend/sites/login.php")
                    .removeClass("disabled")
                    .css("pointer-events", "");
                $("#checkout-hint").hide();
            }
            else {
                $("#checkout-button")
                    .removeAttr("href")
                    .addClass("disabled")
                    .css("pointer-events", "none");
                $("#checkout-hint")
                    .show()
                    .text("Add an item to your cart to continue.");
            }
            return;
        }
        else {
            if (isGuest) {
                $("#checkout-button")
                    .text("Log in to proceed")
                    .attr("href", "/itea/frontend/sites/login.php")
                    .removeClass("disabled")
                    .css("pointer-events", "");
            }
            else {
                $("#checkout-button")
                    .attr("href", "/itea/frontend/sites/checkout.php")
                    .removeClass("disabled")
                    .css("pointer-events", "");
            }
            $("#checkout-hint")
                .show()
                .text("Have a voucher? You can apply it at checkout!");
        }
        const template = document.getElementById("cart-item-template");
        let total = 0;
        cartItems.forEach(function (item) {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            const $item = $(document.importNode(template.content, true)
                .firstElementChild);
            $item.find(".cart-remove").attr("data-id", String(item.id));
            $item
                .find(".cart-item-image")
                .attr("src", `/itea/backend/productpictures/${item.file_path}`)
                .attr("alt", item.name);
            $item.find(".cart-item-title").text(item.name);
            $item.find(".cart-item-price").text(`€${Number(item.price).toFixed(2)}`);
            $item
                .find(".cart-quantity-input")
                .val(item.quantity)
                .attr("data-id", String(item.id));
            $item.find(".cart-item-subtotal").text(`€${Number(subtotal).toFixed(2)}`);
            $cartContainer.append($item);
        });
        $("#subtotal-value").text("€" + total.toFixed(2));
    }
    $(document).on("change", ".cart-quantity-input", function () {
        const productId = Number($(this).data("id"));
        let quantity = parseInt($(this).val()) || 1;
        if (quantity <= 0) {
            quantity = 1;
        }
        updateCart(productId, quantity);
    });
    $(document).on("click", ".cart-remove", function () {
        const productId = Number($(this).data("id"));
        if (confirm("Are you sure you want to delete " +
            $(this).closest(".cart-item").find("img").attr("alt") +
            " from your cart?")) {
            removeFromCart(productId);
        }
        function removeFromCart(productId) {
            $.ajax({
                url: "/itea/backend/serviceHandler.php?handler=cart&method=removeFromCart",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({ productId }),
                success: function (response) {
                    if (!response.error) {
                        $("#cart-count").text(response.cartCount);
                        loadCart();
                    }
                },
                error: function (err) {
                    console.error("Error removing from cart: ", err);
                },
            });
        }
    });
});
