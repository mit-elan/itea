/**
 * checkout.ts – Bestellabschluss, Zahlungsauswahl, Gutschein
 * Sprint 2: SCRUM-60, SCRUM-61
 */
interface Cart {
  id: number;
  file_path: string;
  name: string;
  price: number;
  quantity: number;
}

$(document).ready(function () {
  checkLoginStatus().then(function (response) {
    updateNavigation(response);
    if (response.loggedIn && response.role === "customer") {
      loadCart();
    }
  });

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

  function renderCart(cartItems: Cart[]) {
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
            <div class="row align-items-center mb-4">
                <div class="col-8">
                    <div class="d-flex align-items-center">
                        <div class="cart-item-image-wrapper me-3" style="width: 60px; height: 60px;">
                            <img src="/itea/backend/productpictures/${item.file_path}"
                                 alt="${item.name}" class="cart-item-image">
                        </div>
                        <div>
                            <h3 class="cart-item-title h6 mb-1">${item.name}</h3>
                            <span class="text-muted small">100g x ${item.quantity}</span>
                        </div>
                    </div>
                </div>
                <div class="col-4 text-end fw-bold">
                    €${Number(subtotal).toFixed(2)}
                </div>
            </div>`;

      $cartContainer.append(cartItemHtml);
    });

    $("#subtotal-value").text("€" + total.toFixed(2));
    $("#total-value").text("€" + total.toFixed(2));
  }

  $(".cart-checkout-button").on("click", function () {
    $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=orders&method=placeOrder",
      type: "POST",
      dataType: "json",
      success: function (response) {
        if (response.success) {
          window.location.href = "/itea/frontend/sites/account.php";
        } else {
          alert("Order failed: " + response.error);
        }
      },
      error: function (err) {
        console.error("Error placing order: ", err);
        alert("Failed to place order.");
      },
    });
  });
});
