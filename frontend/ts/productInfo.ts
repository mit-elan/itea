/**
 * Product detail page initialization
 * Loads and displays individual product information with cart integration.
 */

$(document).ready(function () {
  // Extract product ID from URL search parameters
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  // Update navigation based on login status
  checkLoginStatus().then(function (response) {
    updateNavigation(response);
  });

  $("#no-tea-found").hide();

  // Load product if ID was provided in URL, otherwise show not-found message
  if (productId) {
    loadProduct(productId);
  } else {
    showProductNotFound();
    return;
  }

  // Quantity adjustment controls for cart addition
  $("#button-minus").on("click", function () {
    decreaseQuantity();
  });

  $("#button-plus").on("click", function () {
    increaseQuantity();
  });

  /**
   * Fetches product data from backend and renders it.
   */
  function loadProduct(selectedProductId: string): void {
    $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=products&method=getById",
      type: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({ id: Number(selectedProductId) }),

      success: function (response: Product) {
        renderProduct(response);
      },

      error: function (xhr: JQuery.jqXHR) {
        console.error("Error loading product:", getProductInfoBackendError(xhr));
        showProductNotFound();
      },
    });
  }

  /**
   * Renders product details to the page.
   * Populates image, title, rating, description, price, and cart button.
   */
  function renderProduct(product: Product): void {
    // Set product image with fallback alt text
    $("#product-detail-img")
      .attr("src", "/itea/backend/productpictures/" + product.filePath)
      .attr("alt", product.name);

    $("#product-title").text(product.name);

    // Build star display: filled stars for rating, empty stars to reach 5
    const stars = "★".repeat(Math.floor(product.rating || 0)).padEnd(5, "☆");

    // Show rating number if available, otherwise show "(0 reviews)"
    const reviewText =
      typeof product.rating === "number" && product.rating > 0
        ? Number(product.rating).toFixed(2) + " Star-Rating"
        : "(0 reviews)";

    $("#star-rating").text(stars);
    $("#rating-text").text(reviewText);
    $("#product-description").text(product.description);

    // Display price per 100g unit
    $("#product-price").text(`€ ${Number(product.price).toFixed(2)} | 100g`);

    // Attach product ID to cart button for addToCartDetail handler
    $("#button-addToCartDetail").data("id", product.id);
  }

  /**
   * Decreases quantity, minimum value is 1.
   */
  function decreaseQuantity(): void {
    let currentValue =
      parseInt(String($("#quantity-input").val() ?? ""), 10) || 1;

    if (currentValue > 1) {
      currentValue--;
      $("#quantity-input").val(currentValue);
    }
  }

  /**
   * Increases quantity with no upper limit.
   */
  function increaseQuantity(): void {
    let currentValue =
      parseInt(String($("#quantity-input").val() ?? ""), 10) || 1;

    currentValue++;
    $("#quantity-input").val(currentValue);
  }

  function showProductNotFound(): void {
    $("#product-details").hide();
    $("#no-tea-found").show();
  }

  function getProductInfoBackendError(xhr: JQuery.jqXHR): string {
    const fallbackMessage = "Failed to load product.";

    if (!xhr.responseText) {
      return fallbackMessage;
    }

    try {
      const response = JSON.parse(xhr.responseText) as ApiErrorResponse;

      return response.error ?? fallbackMessage;
    } catch {
      return xhr.responseText;
    }
  }
});