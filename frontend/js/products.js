"use strict";
/**
 * Product listing page
 * Loads all products, renders product cards,
 * handles category/search filters and drag-and-drop cart interaction.
 */
$(document).ready(function () {
    const categoryIdToName = {
        1: "black",
        2: "green",
        3: "fruit",
        4: "herbal",
    };
    // Flag to prevent the stop event from hiding the drop zone when a drop just occurred
    let dropOccurred = false;
    setupFilterLogic();
    checkLoginStatus().then(function (response) {
        updateNavigation(response);
        loadProducts();
    });
    // Continuous search filter
    $("#search-input").on("input", function () {
        var _a;
        $(".category-chip.active").removeClass("active");
        $("#button-all").addClass("active");
        const searchTerm = String((_a = $(this).val()) !== null && _a !== void 0 ? _a : "").toLowerCase().trim();
        $("#product-list .product-item").each(function () {
            const title = $(this).find(".tea-card-title").text().toLowerCase();
            $(this).toggle(title.includes(searchTerm));
        });
        updateNoProductsMessage();
    });
    function loadProducts() {
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=products&method=getAll",
            type: "GET",
            dataType: "json",
            success: function (response) {
                $("#no-products").hide();
                if (!response || response.length === 0) {
                    $("#product-list").empty();
                    $("#no-products").show();
                    return;
                }
                renderProducts(response);
                initDragDrop();
            },
            error: function (xhr) {
                console.error("Error loading products:", getProductsBackendError(xhr));
                $("#no-products").show();
            },
        });
    }
    function renderProducts(products) {
        const container = $("#product-list");
        container.empty();
        const template = document.getElementById("product-card-template");
        const templateElement = template === null || template === void 0 ? void 0 : template.content.firstElementChild;
        if (!templateElement) {
            console.error("Product card template could not be loaded.");
            $("#no-products").show();
            return;
        }
        products.forEach(function (product) {
            var _a;
            if (!product.id || !product.name || !product.price) {
                return;
            }
            const categoryName = (_a = categoryIdToName[product.categoryId]) !== null && _a !== void 0 ? _a : "unknown";
            const stars = "★".repeat(Math.floor(product.rating || 0)).padEnd(5, "☆");
            const reviewText = typeof product.rating === "number" && product.rating > 0
                ? product.rating + " Star-Rating"
                : "(0 reviews)";
            const card = $(templateElement.cloneNode(true));
            card.attr("data-category", categoryName);
            card
                .find(".product-link")
                .attr("href", `productInfo.html?id=${product.id}`);
            card
                .find(".tea-card-image")
                .attr("src", `/itea/backend/productpictures/${product.filePath}`)
                .attr("alt", product.name);
            card.find(".tea-card-title").text(product.name);
            card.find(".tea-card-description").text(product.description);
            card.find(".stars").text(stars);
            card.find(".review-text").text(reviewText);
            card.find(".tea-card-price").text(formatProductsCurrency(product.price));
            card.find(".button-addToCartList").attr("data-id", String(product.id));
            container.append(card);
        });
    }
    function initDragDrop() {
        // Drag a card by its handle. A small custom helper follows the cursor.
        // When dragging starts, show the fixed drop zone below the header.
        $(".product-item").draggable({
            handle: ".drag-handle",
            helper: function () {
                const name = $(this).find(".tea-card-title").text();
                return $("<div>")
                    .addClass("drag-helper")
                    .append($("<i>").addClass("bi bi-bag-plus"))
                    .append(" " + name);
            },
            cursorAt: { top: 18, left: 18 },
            revert: "invalid",
            zIndex: 9999,
            start: function () {
                // Reset the flag on each new drag start
                dropOccurred = false;
                const zone = $("#drag-drop-zone-fixed");
                zone.addClass("active").fadeIn(200);
            },
            stop: function () {
                const zone = $("#drag-drop-zone-fixed");
                // Only hide the zone if no drop just occurred.
                // If a drop occurred, showDropConfirmation() or showDropError() handles hiding.
                if (!dropOccurred && zone.hasClass("active")) {
                    zone.fadeOut(200, function () {
                        zone.removeClass("active");
                    });
                }
            },
        });
        $("#drag-drop-zone-fixed").droppable({
            accept: ".product-item",
            tolerance: "pointer",
            hoverClass: "drop-zone-hover",
            drop: function (_event, ui) {
                // Set flag so stop() will not hide the zone immediately
                dropOccurred = true;
                const productId = ui.draggable.find(".button-addToCartList").data("id");
                if (productId) {
                    window.addToCartViaDrag(Number(productId), showDropConfirmation, showDropError);
                }
            },
        });
    }
    // Show a success or error message inside the drop zone and then hide it.
    // zone = outer container, message = content inside the container
    function showDropMessage(message) {
        const defaultMessage = $(".drag-drop-zone-default");
        const zone = $("#drag-drop-zone-fixed");
        defaultMessage.hide();
        message.fadeIn(200).delay(2000).fadeOut(300);
        zone.delay(2000).fadeOut(300, function () {
            zone.removeClass("active");
            defaultMessage.show();
            dropOccurred = false;
        });
    }
    function showDropConfirmation() {
        showDropMessage($(".drag-drop-zone-success"));
    }
    function showDropError() {
        showDropMessage($(".drag-drop-zone-error"));
    }
    function setupFilterLogic() {
        $(".category-chip").on("click", function () {
            $(".category-chip").removeClass("active");
            $(this).addClass("active");
            const filterValue = $(this).attr("data-category");
            if (filterValue === "all") {
                $(".product-item").show();
            }
            else {
                $(".product-item").hide();
                $(`.product-item[data-category="${filterValue}"]`).show();
            }
            updateNoProductsMessage();
        });
    }
    function updateNoProductsMessage() {
        const visibleCards = $(".product-item:visible").length;
        $("#no-products").toggle(visibleCards === 0);
    }
    function formatProductsCurrency(value) {
        return `€${Number(value !== null && value !== void 0 ? value : 0).toFixed(2)}`;
    }
    function getProductsBackendError(xhr) {
        var _a;
        const fallbackMessage = "Failed to load products.";
        if (!xhr.responseText) {
            return fallbackMessage;
        }
        try {
            const response = JSON.parse(xhr.responseText);
            return (_a = response.error) !== null && _a !== void 0 ? _a : fallbackMessage;
        }
        catch (_b) {
            return xhr.responseText;
        }
    }
});
