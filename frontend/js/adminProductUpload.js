"use strict";
/**
 * Handles the admin product upload and edit page.
 * The page creates a new product or edits an existing product based on the URL id parameter.
 */
$(document).ready(function () {
    requireRole("admin", function () {
        initializeProductUploadPage();
    });
    function initializeProductUploadPage() {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get("id");
        let existingFilePath = "";
        if (!productId) {
            $("#upload-edit-title").text("Upload New Product");
            $("#upload-edit-button").text("Upload Product");
        }
        loadCategories(productId, function () {
            if (productId) {
                loadProduct(productId);
            }
        });
        $("#product-upload-form").on("submit", function (event) {
            event.preventDefault();
            handleProductFormSubmit(productId, existingFilePath, function (filePath) {
                existingFilePath = filePath;
            });
        });
    }
    function loadCategories(productId, onLoaded) {
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=products&method=getCategories",
            type: "GET",
            dataType: "json",
            success: function (categories) {
                const select = $("#category");
                select.empty();
                categories.forEach(function (category) {
                    select.append($("<option>").val(category.id).text(category.name));
                });
                onLoaded();
            },
            error: function (xhr) {
                showAdminProductUploadBackendError(xhr);
            },
        });
    }
    function loadProduct(productId) {
        $("#upload-edit-title").text("Edit Product");
        $("#upload-edit-button").text("Save Changes");
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=products&method=getById",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({ id: Number(productId) }),
            success: function (product) {
                var _a, _b;
                $("#name").val(product.name);
                $("#description").val(product.description);
                $("#price").val(String(product.price));
                $("#rating").val(String((_a = product.rating) !== null && _a !== void 0 ? _a : ""));
                $("#category").val(String(product.categoryId));
                $("#product-upload-form").data("existing-file-path", (_b = product.filePath) !== null && _b !== void 0 ? _b : "");
            },
            error: function (xhr) {
                showAdminProductUploadBackendError(xhr);
            },
        });
    }
    function handleProductFormSubmit(productId, existingFilePath, updateExistingFilePath) {
        var _a;
        const form = $("#product-upload-form")[0];

        // Run HTML5 validation before proceeding
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }

        hideProductUploadMessages();
        const validationResult = validateProductForm(productId);
        if (!validationResult.valid || !validationResult.product) {
            return;
        }
        const imageFile = getSelectedImageFile();
        if (imageFile) {
            uploadProductImage(imageFile, function (filePath) {
                if (!validationResult.product) {
                    return;
                }
                const productPayload = Object.assign(Object.assign({}, validationResult.product), { filePath: filePath });
                updateExistingFilePath(filePath);
                submitProduct(productId, productPayload);
            });
            return;
        }
        const storedFilePath = String((_a = $("#product-upload-form").data("existing-file-path")) !== null && _a !== void 0 ? _a : "") ||
            existingFilePath;
        submitProduct(productId, Object.assign(Object.assign({}, validationResult.product), { filePath: storedFilePath }));
    }
    function validateProductForm(productId) {
        let hasError = false;
        const rating = Number.parseFloat(getAdminProductUploadInputValue("#rating"));
        const price = Number.parseFloat(getAdminProductUploadInputValue("#price"));
        const imageFile = getSelectedImageFile();
        if (!productId && !imageFile) {
            $("#field-error").text("Please select a product image.").show();
            hasError = true;
        }
        if (Number.isNaN(rating) || rating <= 0 || rating > 5) {
            $("#rating-error")
                .text("Please enter a valid rating between 0 and 5.")
                .show();
            hasError = true;
        }
        if (Number.isNaN(price) || price <= 0) {
            $("#price-error")
                .text("Please enter a valid price greater than 0.")
                .show();
            hasError = true;
        }
        const product = {
            id: productId ? Number.parseInt(productId, 10) : 0,
            categoryId: Number.parseInt(getAdminProductUploadInputValue("#category"), 10),
            name: getAdminProductUploadInputValue("#name").trim(),
            description: getAdminProductUploadInputValue("#description").trim(),
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
        if (hasError) {
            return { valid: false };
        }
        return {
            valid: true,
            product: product,
        };
    }
    function uploadProductImage(imageFile, onSuccess) {
        const formData = new FormData();
        formData.append("image", imageFile);
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=products&method=uploadImage",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            dataType: "json",
            success: function (response) {
                onSuccess(response.filePath);
            },
            error: function (xhr) {
                showAdminProductUploadBackendError(xhr);
            },
        });
    }
    function submitProduct(productId, payload) {
        const method = productId ? "update" : "create";
        $.ajax({
            url: `/itea/backend/serviceHandler.php?handler=products&method=${method}`,
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(payload),
            success: function (response) {
                var _a;
                const action = productId ? "updated" : "created";
                const productName = (_a = response.name) !== null && _a !== void 0 ? _a : payload.name;
                const overviewLink = productId
                    ? ` <a href="/itea/frontend/sites/admin/productOverview.html">Back to product overview</a>`
                    : "";
                $("#upload-success")
                    .html(`Product "${productName}" ${action} successfully!${overviewLink}`)
                    .show();
                if (!productId) {
                    $("#product-upload-form")[0].reset();
                    $("#description").css("height", "");
                    $("#product-upload-form").removeData("existing-file-path");
                }
            },
            error: function (xhr) {
                showAdminProductUploadBackendError(xhr);
            },
        });
    }
    function getSelectedImageFile() {
        var _a;
        return (_a = $("#product-image")[0].files) === null || _a === void 0 ? void 0 : _a[0];
    }
    function getAdminProductUploadInputValue(selector) {
        const value = $(selector).val();
        return typeof value === "string" ? value : "";
    }
    function hideProductUploadMessages() {
        $("#field-error, #rating-error, #price-error, #database-error")
            .stop(true, true)
            .hide()
            .text("");
    }
    function showAdminProductUploadBackendError(xhr) {
        var _a;
        let errorMessage = "An unexpected error occurred.";
        if (xhr.responseText) {
            try {
                const response = JSON.parse(xhr.responseText);
                errorMessage = (_a = response.error) !== null && _a !== void 0 ? _a : errorMessage;
            }
            catch (_b) {
                errorMessage = errorMessage;
            }
        }
        $("#database-error").text(errorMessage).show();
    }
});
