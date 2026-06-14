/**
 * Cart page and cart interaction logic
 * Handles session-based cart actions without full page reloads.
 */

interface CartActionResponse {
  success?: boolean;
  cartCount?: number;
  error?: string;
}

interface CartLoadResponse {
  success?: boolean;
  cartItems: Cart[];
  error?: string;
}

interface CartBackendErrorResponse {
  error?: string;
}

function addToCart(productId: number, quantity: number): void {
  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=cart&method=addToCart",
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({ productId, quantity }),

    success: function (response: CartActionResponse) {
      if (response.error) {
        alert("Failed to add product to cart.");
        return;
      }

      $("#cart-count").text(response.cartCount ?? 0);
    },

    error: function (xhr: JQuery.jqXHR) {
      console.error("Error adding to cart:", getCartBackendError(xhr));
      alert("Failed to add product to cart.");
    },
  });
}

function addToCartViaDrag(
  productId: number,
  onSuccess?: () => void,
  onError?: () => void,
): void {
  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=cart&method=addToCart",
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({ productId: productId, quantity: 1 }),

    success: function (response: CartActionResponse) {
      if (response.error) {
        console.error("Cart error:", response.error);

        if (onError) {
          onError();
        }

        return;
      }

      $("#cart-count").text(response.cartCount ?? 0);

      if (onSuccess) {
        onSuccess();
      }
    },

    error: function (xhr: JQuery.jqXHR) {
      console.error("Cart error:", getCartBackendError(xhr));

      if (onError) {
        onError();
      }
    },
  });
}

window.addToCartViaDrag = addToCartViaDrag;

// Tracks guest status to show login prompt instead of checkout
let isGuest = false;

$(document).ready(function () {
  checkLoginStatus().then(function (response) {
    updateNavigation(response);

    isGuest = response.role === "guest";
    loadCart();

    if (isGuest) {
      setCheckoutForGuest();
    }
  });

  // Add product from product listing to cart
  $(document).on("click", ".button-addToCartList", function (event) {
    event.preventDefault();

    const productId = Number($(this).data("id"));
    addToCart(productId, 1);
  });

  // Add product from detail page to cart with custom quantity
  $("#button-addToCartDetail").on("click", function (event) {
    event.preventDefault();

    const productId = Number($(this).data("id"));
    const quantity =
      parseInt(String($("#quantity-input").val() ?? ""), 10) || 1;

    if (quantity <= 0) {
      alert("Please insert a valid number of products.");
      return;
    }

    addToCart(productId, quantity);
  });

  $(document).on("change", ".cart-quantity-input", function () {
    const productId = Number($(this).data("id"));
    let quantity = parseInt(String($(this).val() ?? ""), 10) || 1;

    if (quantity <= 0) {
      quantity = 1;
    }

    updateCart(productId, quantity);
  });

  $(document).on("click", ".cart-remove", function () {
    const productId = Number($(this).data("id"));
    const productName =
      $(this).closest(".cart-item").find("img").attr("alt") ?? "this product";

    if (
      confirm(`Are you sure you want to delete ${productName} from your cart?`)
    ) {
      removeFromCart(productId);
    }
  });
});

function updateCart(productId: number, quantity: number): void {
  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=cart&method=updateCart",
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({ productId, quantity }),

    success: function (response: CartActionResponse) {
      if (response.error) {
        alert("Failed to update cart.");
        return;
      }

      $("#cart-count").text(response.cartCount ?? 0);

      // Reload entire cart to sync subtotals and total price after quantity change
      loadCart();
    },

    error: function (xhr: JQuery.jqXHR) {
      console.error("Error updating cart:", getCartBackendError(xhr));
      alert("Failed to update cart.");
    },
  });
}

function loadCart(): void {
  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=cart&method=loadCart",
    type: "GET",
    dataType: "json",

    success: function (response: CartLoadResponse) {
      if (response.error) {
        showCartError(response.error);
        return;
      }

      // Clear any previous errors on successful load
      $("#cart-error").hide().text("");

      renderCart(response.cartItems);
    },

    error: function (xhr: JQuery.jqXHR) {
      showCartError(getCartBackendError(xhr));
      console.error("Error loading cart:", xhr);
    },
  });
}

function renderCart(cartItems: Cart[]): void {
  const cartContainer = $("#cart-items-container");
  cartContainer.empty();

  if (!cartItems || cartItems.length === 0) {
    cartContainer.append(
      $("<p>").addClass("text-center").text("Your cart is empty."),
    );

    $("#subtotal-value").text("€0.00");
    updateCheckoutState(false);
    return;
  }

  updateCheckoutState(true);

  const template = document.getElementById(
    "cart-item-template",
  ) as HTMLTemplateElement | null;

  const templateElement = template?.content.firstElementChild;

  if (!templateElement) {
    showCartError("Cart template could not be loaded.");
    return;
  }

  let total = 0;

  cartItems.forEach(function (item: Cart) {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const cartItem = $(templateElement.cloneNode(true) as HTMLElement);

    cartItem.find(".cart-remove").attr("data-id", String(item.id));
    cartItem
      .find(".cart-item-image")
      .attr("src", `/itea/backend/productpictures/${item.file_path}`)
      .attr("alt", item.name);
    cartItem.find(".cart-item-title").text(item.name);
    cartItem.find(".cart-item-price").text(formatCartCurrency(item.price));
    cartItem
      .find(".cart-quantity-input")
      .val(item.quantity)
      .attr("data-id", String(item.id));
    cartItem.find(".cart-item-subtotal").text(formatCartCurrency(subtotal));

    cartContainer.append(cartItem);
  });

  $("#subtotal-value").text(formatCartCurrency(total));
}

function removeFromCart(productId: number): void {
  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=cart&method=removeFromCart",
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({ productId }),

    success: function (response: CartActionResponse) {
      if (response.error) {
        showCartError(response.error);
        return;
      }

      $("#cart-count").text(response.cartCount ?? 0);
      loadCart();
    },

    error: function (xhr: JQuery.jqXHR) {
      console.error("Error removing from cart:", getCartBackendError(xhr));
      showCartError("Failed to remove product from cart.");
    },
  });
}

function updateCheckoutState(hasItems: boolean): void {
  if (!hasItems) {
    if (isGuest) {
      setCheckoutForGuest();
      $("#checkout-hint").hide();
      return;
    }

    $("#checkout-button")
      .removeAttr("href")
      .addClass("disabled")
      .css("pointer-events", "none");

    $("#checkout-hint").show().text("Add an item to your cart to continue.");
    return;
  }

  if (isGuest) {
    setCheckoutForGuest();
  } else {
    $("#checkout-button")
      .attr("href", "/itea/frontend/sites/checkout.html")
      .removeClass("disabled")
      .css("pointer-events", "");
  }

  $("#checkout-hint")
    .show()
    .text("Have a voucher? You can apply it at checkout!");
}

function setCheckoutForGuest(): void {
  $("#checkout-button")
    .text("Log in to proceed")
    .attr("href", "/itea/frontend/sites/login.html")
    .removeClass("disabled")
    .css("pointer-events", "");
}

function showCartError(message: string): void {
  $("#cart-error").text(message).removeClass("d-none").show();
}

function formatCartCurrency(value: number | string | null): string {
  return `€${Number(value ?? 0).toFixed(2)}`;
}

function getCartBackendError(xhr: JQuery.jqXHR): string {
  const fallbackMessage = "Failed to load cart. Please try again.";

  if (!xhr.responseText) {
    return fallbackMessage;
  }

  try {
    const response = JSON.parse(xhr.responseText) as CartBackendErrorResponse;

    return response.error ?? fallbackMessage;
  } catch {
    return xhr.responseText;
  }
}
