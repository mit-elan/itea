"use strict";
/**
 * Product detail page initialization
 * Loads and displays individual product information with cart integration
 */
$(document).ready(function () {
    // Extract product ID from URL search parameters
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");
    let currentValue; // Quantity selected for cart addition
    // Update navigation based on login status
    checkLoginStatus().then(function (response) {
        updateNavigation(response);
    });
    $("#no-tea-found").hide();
    // Load product if ID provided in URL, otherwise show not-found message
    if (productId) {
        loadProduct();
    }
    else {
        $("#product-details").hide();
        $("#no-tea-found").show();
        return;
    }
    /**
     * Fetches product data from backend and renders it
     */
    function loadProduct() {
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=products&method=getById",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ id: Number(productId) }),
            dataType: "json",
            success: function (data) {
                // Handle empty response (product not found)
                if (!data || (Array.isArray(data) && data.length === 0)) {
                    $("#product-details").hide();
                    $("#no-tea-found").show();
                    return;
                }
                renderProduct(data);
            },
            error: function (err) {
                console.error("Error loading product", err);
            },
        });
    }
    /**
     * Renders product details to page
     * Populates image, title, rating, description, price, and cart button
     */
    function renderProduct(product) {
        // Set product image with fallback alt text
        $("#product-detail-img")
            .attr("src", "/itea/backend/productpictures/" + product.filePath)
            .attr("alt", product.name);
        $("#product-title").text(product.name);
        // Build star display: filled stars (★) for rating, empty stars (☆) to reach 5
        const stars = "★".repeat(Math.floor(product.rating || 0)).padEnd(5, "☆");
        // Show rating number if available, otherwise show "(0 reviews)"
        const reviewText = typeof product.rating === "number" && product.rating > 0
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
    // Quantity adjustment controls (minus/plus buttons)
    /**
     * Decreases quantity, minimum value is 1
     */
    $("#button-minus").on("click", function () {
        currentValue = parseInt($("#quantity-input").val()) || 1;
        if (currentValue > 1) {
            currentValue--;
            $("#quantity-input").val(currentValue);
        }
    });
    /**
     * Increases quantity with no upper limit
     */
    $("#button-plus").on("click", function () {
        currentValue = parseInt($("#quantity-input").val()) || 1;
        currentValue++;
        $("#quantity-input").val(currentValue);
    });
});
