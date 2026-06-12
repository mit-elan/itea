"use strict";
$(document).ready(function () {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");
    let existingFilePath = "";
    checkLoginStatus().then(function (response) {
        if (response.role !== "admin") {
            window.location.href = "/itea/frontend/index.html";
        }
    });
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=products&method=getCategories",
        type: "GET",
        dataType: "json",
        success: function (categories) {
            const $select = $("#category");
            $select.empty();
            categories.forEach((cat) => {
                $select.append(`<option value="${cat.id}">${cat.name}</option>`);
            });
            // populate category after options are loaded
            if (productId)
                loadProduct();
        },
    });
    function loadProduct() {
        $("#upload-edit-title").text("Edit Product");
        $("#upload-edit-button").text("Save Changes");
        $.ajax({
            url: `/itea/backend/serviceHandler.php?handler=products&method=getById&id=${productId}`,
            type: "GET",
            dataType: "json",
            success: function (product) {
                var _a, _b;
                if (!product || !product.id) {
                    $("#product-upload-form").hide();
                    $("#error-message")
                        .text("Product not found. Return to product dashboard to edit a product.")
                        .show();
                    $("#upload-edit-button").prop("disabled", true);
                    return;
                }
                existingFilePath = (_a = product.filePath) !== null && _a !== void 0 ? _a : "";
                $("#name").val(product.name);
                $("#description").val(product.description);
                $("#price").val(String(product.price));
                $("#rating").val(String((_b = product.rating) !== null && _b !== void 0 ? _b : ""));
                $("#category").val(String(product.categoryId));
            },
            error: showBackendError,
        });
    }
    if (!productId) {
        $("#upload-edit-title").text("Upload New Product");
        $("#upload-edit-button").text("Upload Product");
    }
    function showBackendError(xhr) {
        const res = JSON.parse(xhr.responseText);
        $("#database-error").text(res.error).show();
    }
    $("#product-upload-form").on("submit", function (e) {
        var _a;
        e.preventDefault();
        let hasError = false;
        $("#field-error, #rating-error, #price-error, #database-error")
            .stop(true, true)
            .hide()
            .text("");
        const rating = parseFloat($("#rating").val());
        const price = parseFloat($("#price").val());
        const imageFile = (_a = $("#product-image")[0].files) === null || _a === void 0 ? void 0 : _a[0];
        if (!productId && !imageFile) {
            $("#field-error").text("Please select a product image.").show();
            hasError = true;
        }
        if (isNaN(rating) || rating <= 0 || rating > 5) {
            $("#rating-error")
                .text("Please enter a valid rating between 0 and 5.")
                .show();
            hasError = true;
        }
        if (isNaN(price) || price <= 0) {
            $("#price-error")
                .text("Please enter a valid price greater than 0.")
                .show();
            hasError = true;
        }
        const product = {
            id: productId ? parseInt(productId) : 0,
            categoryId: parseInt($("#category").val()),
            name: $("#name").val().trim(),
            description: $("#description").val().trim(),
            rating: rating,
            price: price,
        };
        const missingFields = Object.entries(product)
            .filter(([key, value]) => key !== "id" &&
            (value === "" || value === null || value === undefined))
            .map(([key]) => key);
        if (missingFields.length > 0) {
            $("#field-error")
                .text("Please fill in all required fields: " + missingFields.join(", "))
                .show();
            hasError = true;
        }
        if (hasError)
            return;
        if (imageFile) {
            // upload new image first, then create or update
            const formData = new FormData();
            formData.append("image", imageFile);
            $.ajax({
                url: "/itea/backend/serviceHandler.php?handler=products&method=uploadImage",
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                dataType: "json",
                success: function (imageResponse) {
                    submitProduct(Object.assign(Object.assign({}, product), { filePath: imageResponse.filePath }));
                },
                error: showBackendError,
            });
        }
        else {
            // edit mode, no new image — keep existing
            submitProduct(Object.assign(Object.assign({}, product), { filePath: existingFilePath }));
        }
    });
    function submitProduct(payload) {
        const method = productId ? "update" : "create";
        $.ajax({
            url: `/itea/backend/serviceHandler.php?handler=products&method=${method}`,
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(payload),
            success: function (response) {
                const action = productId ? "updated" : "created";
                const overviewLink = productId
                    ? ` <a href="/itea/frontend/sites/admin/productOverview.html">Back to product overview</a>`
                    : "";
                $("#upload-success")
                    .html(`Product "${response.name}" ${action} successfully!${overviewLink}`)
                    .show();
                if (!productId) {
                    $("#product-upload-form")[0].reset();
                    $("#description").css("height", "");
                }
            },
            error: showBackendError,
        });
    }
});
