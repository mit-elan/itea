"use strict";
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
$(document).ready(function () {
    $("#no-tea-found").hide();
    // 1. Daten laden
    if (productId) {
        loadProduct();
    }
    else {
        $("#product-details").hide();
        $("#no-tea-found").show();
        return;
    }
    function loadProduct() {
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=products&method=getById&id=" +
                productId,
            method: "GET",
            dataType: "json", // Stellt sicher, dass jQuery das JSON automatisch parst
            success: function (data) {
                if (!data || (Array.isArray(data) && data.length === 0)) {
                    $("#product-details").hide();
                    $("#no-tea-found").show();
                    return;
                }
                renderProduct(data);
            },
            error: function (err) {
                console.error("Fehler beim Laden des Produkts", err);
            },
        });
    }
    function renderProduct(product) {
        $("#product-image img")
            .attr("src", "/iTEA/backend/productpictures/" + product.file_path)
            .attr("alt", product.name);
        $("#product-title").text(product.name);
        const stars = "★".repeat(Math.floor(product.rating || 0)).padEnd(5, "☆");
        const reviewText = product.rating > 0 ? product.rating + " Star-Rating" : " (0 reviews)";
        $("#star-rating").text(stars);
        $("#rating-text").text(reviewText);
        $("#product-description").text(product.description);
        $("#product-price").text(`€ ${product.price} | 100g`);
    }
    // 2. Quantity Logik
    $("#button-minus").on("click", function () {
        let currentValue = parseInt($("#quantity-input").val()) || 1;
        if (currentValue > 1) {
            currentValue--;
            $("#quantity-input").val(currentValue);
        }
    });
    $("#button-plus").on("click", function () {
        let currentValue = parseInt($("#quantity-input").val()) || 1;
        currentValue++;
        $("#quantity-input").val(currentValue);
    });
});
