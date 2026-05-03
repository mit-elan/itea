"use strict";
/**
 * cart.ts – Warenkorb-Logik (Session-basiert, kein Page-Reload)
 * Sprint 2: SCRUM-60, SCRUM-57
 */
$(document).ready(function () {
    let userId = null;
    let userIsAllowed = false;
    checkLoginStatus().then(function (response) {
        updateNavigation(response);
        if (response.loggedIn && response.role === "customer") {
            userId = response.userId;
            userIsAllowed = true;
            loadCart();
        }
    });
    $(document).on("click", ".button-addToCartList", function (event) {
        event.preventDefault();
        const productId = $(this).data("id");
        addToCart(userId, productId, 1);
    });
    $("#button-addToCartDetail").on("click", function (e) {
        e.preventDefault();
        if (!userIsAllowed) {
            alert("Please log in to buy!");
            return false;
        }
        const quantity = parseInt($("#quantity-input").val()) || 1;
        if (quantity <= 0) {
            alert("Please insert a valid number of Products");
            return false;
        }
        addToCart(userId, productId, quantity);
    });
    function addToCart(userId, productId, quantity) {
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=cart&method=addToCart",
            type: "POST",
            data: { userId, productId, quantity },
            success: function (response) {
                if (response.error == "Missing User") {
                    alert("User not found! Please log in to add products to your cart.");
                    return;
                }
                else if (response.error) {
                    alert("Missing paramters - please try again");
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
        let total = 0;
        cartItems.forEach(function (item) {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            const cartItemHtml = `
    <article class="cart-item">
        <div class="row align-items-center">
            <div class="col-md-6 col-12">
                <div class="cart-item-main">
                    <button class="cart-remove" aria-label="Remove item">×</button>
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
                    <input type="number" value="${item.quantity}" min="1" class="cart-quantity-input">
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
            $("#subtotal-value").text("€" + total.toFixed(2));
            $("#total-value").text("€" + total.toFixed(2));
        });
    }
    // 2. Event-Delegation für den Remove-Button
    $(document).on("click", ".remove-from-cart-btn", function () {
        const productId = $(this).data("id");
        removeFromCart(productId);
    });
    //Funktionier noch nicht 
    function removeFromCart(id) {
        $.ajax({
            url: "remove_from_cart.php",
            method: "POST",
            data: { id: id },
            success: function () {
                loadCart(); // Warenkorb nach dem Löschen neu laden
            },
        });
    }
});
