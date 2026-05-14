"use strict";
/**
 * cart.ts – Warenkorb-Logik (Session-basiert, kein Page-Reload)
 * Sprint 2: SCRUM-60, SCRUM-57
 */
$(document).ready(function () {
    checkLoginStatus().then(function (response) {
        updateNavigation(response);
        loadCart();
        if (response.role === "guest") {
            $("#checkout-button")
                .text("Log in to proceed")
                .attr("href", "/itea/frontend/sites/login.php");
        }
    });
    //Wieso hier .button-addToCartList (ich schätze das ist referenz auf die klasse also das wurde der Klasse hinzugefügt )
    $(document).on("click", ".button-addToCartList", function (event) {
        event.preventDefault();
        const productId = $(this).data("id");
        addToCart(productId, 1);
    });
    //Hier #button-addToCartDetail - hier ist es eine id auf die referenziert wrid also der button hat eine ID ich nehme an hier deshalb weil es nur einen button mit dieser ID auf der Detail-Seite gibt aber auf der list seite gibt es eingie Buttons und dann nimmt man den "klassen name?"
    $("#button-addToCartDetail").on("click", function (e) {
        e.preventDefault();
        const productId = $(this).data("id");
        const quantity = parseInt($("#quantity-input").val()) || 1;
        if (quantity <= 0) {
            alert("Please insert a valid number of Products");
            return false;
        }
        addToCart(productId, quantity);
    });
    function addToCart(productId, quantity) {
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=cart&method=addToCart",
            type: "POST",
            data: { productId, quantity },
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
    function updateCart(productId, quantity) {
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=cart&method=updateCart",
            type: "POST",
            data: { productId, quantity },
            success: function (response) {
                if (response.error) {
                    alert("Failed to update cart.");
                    return;
                }
                $("#cart-count").text(response.cartCount);
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
        let total = 0;
        cartItems.forEach(function (item) {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            const cartItemHtml = `
    <article class="cart-item">
        <div class="row align-items-center">
            <div class="col-md-6 col-12">
                <div class="cart-item-main">
                    <button class="cart-remove" data-id="${item.id}" aria-label="Remove item">×</button>
                    <div class="cart-item-image-wrapper">
                        <img src="/itea/backend/productpictures/${item.file_path}" alt="${item.name}" class="cart-item-image">
                    </div>
                    <div class="cart-item-details">
                        <h2 class="cart-item-title">${item.name}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-2 col-4 mt-3 mt-md-0 text-md-center">
                <div class="cart-item-price">€${Number(item.price).toFixed(2)}</div>
            </div>
            <div class="col-md-2 col-4 mt-3 mt-md-0 d-flex flex-column align-items-md-center">
                <div class="cart-item-quantity">
                    <input type="number" value="${item.quantity}" min="1" class="cart-quantity-input" data-id="${item.id}">
                </div>
            </div>
            <div class="col-md-2 col-4 mt-3 mt-md-0 text-end">
                <span class="d-md-none d-block small text-muted">Subtotal</span>
                <div class="cart-item-subtotal">€${Number(subtotal).toFixed(2)}</div>
            </div>
        </div>
    </article>
    `;
            $cartContainer.append(cartItemHtml);
        });
        $("#subtotal-value").text("€" + total.toFixed(2));
        $("#total-value").text("€" + total.toFixed(2));
    }
    $(document).on("change", ".cart-quantity-input", function () {
        const productId = $(this).data("id");
        let quantity = parseInt($(this).val()) || 1;
        if (quantity <= 0) {
            quantity = 1;
        }
        updateCart(productId, quantity);
    });
    $(document).on("click", ".cart-remove", function () {
        const productId = $(this).data("id");
        if (confirm("Are you sure you want to delete " +
            $(this).closest(".cart-item").find("img").attr("alt") +
            " from your cart?")) {
            removeFromCart(productId);
        }
        function removeFromCart(productId) {
            $.ajax({
                url: "/itea/backend/serviceHandler.php?handler=cart&method=removeFromCart",
                method: "POST",
                data: { productId },
                success: function (response) {
                    if (response.success) {
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
