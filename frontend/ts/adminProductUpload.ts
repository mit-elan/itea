/**
 * Admin product upload/edit page
 * Handles both new product creation and existing product editing
 * Determines mode based on URL parameter 'id'
 */
$(document).ready(function () {
  // Admin access only
  requireRole("admin");

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  let existingFilePath = "";

  if (!productId) {
    $("#upload-edit-title").text("Upload New Product");
    $("#upload-edit-button").text("Upload Product");
  }

  // Load categories dropdown on page init
  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=products&method=getCategories",
    type: "GET",
    dataType: "json",
    success: function (categories: { id: number; name: string }[]) {
      const $select = $("#category");
      $select.empty();
      categories.forEach((cat) => {
        $select.append(`<option value="${cat.id}">${cat.name}</option>`);
      });
      // Load product data for editing after categories are populated
      if (productId) loadProduct();
    },
  });

  /**
   * Loads product data from backend and populates form fields for editing
   * Updates page title and button text to reflect edit mode
   */
  function loadProduct(): void {
    $("#upload-edit-title").text("Edit Product");
    $("#upload-edit-button").text("Save Changes");
    $.ajax({
      url: `/itea/backend/serviceHandler.php?handler=products&method=getById`,
      type: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({ id: Number(productId) }),
      success: function (product: Product) {
        if (!product || !product.id) {
          $("#product-upload-form").hide();
          $("#error-message")
            .text(
              "Product not found. Return to product dashboard to edit a product.",
            )
            .show();
          $("#upload-edit-button").prop("disabled", true);
          return;
        }
        // Store existing image path to keep if no new image is uploaded
        existingFilePath = product.filePath ?? "";
        $("#name").val(product.name);
        $("#description").val(product.description);
        $("#price").val(String(product.price));
        $("#rating").val(String(product.rating ?? ""));
        $("#category").val(String(product.categoryId));
      },
      error: showBackendError,
    });
  }

  $("#product-upload-form").on("submit", function (e) {
    e.preventDefault();

    let hasError = false;

    $("#field-error, #rating-error, #price-error, #database-error")
      .stop(true, true)
      .hide()
      .text("");

    const rating = parseFloat($("#rating").val() as string);
    const price = parseFloat($("#price").val() as string);
    const imageFile = ($("#product-image")[0] as HTMLInputElement).files?.[0];

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

    const product: Product = {
      id: productId ? parseInt(productId) : 0,
      categoryId: parseInt($("#category").val() as string),
      name: ($("#name").val() as string).trim(),
      description: ($("#description").val() as string).trim(),
      rating: rating,
      price: price,
    };

    const missingFields = Object.entries(product)
      .filter(
        ([key, value]) =>
          key !== "id" &&
          (value === "" || value === null || value === undefined),
      )
      .map(([key]) => key);

    if (missingFields.length > 0) {
      $("#field-error")
        .text("Please fill in all required fields: " + missingFields.join(", "))
        .show();
      hasError = true;
    }

    if (hasError) return;

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
        success: function (imageResponse: { filePath: string }) {
          submitProduct({ ...product, filePath: imageResponse.filePath });
        },
        error: showBackendError,
      });
    } else {
      // edit mode, no new image — keep existing
      submitProduct({ ...product, filePath: existingFilePath });
    }
  });

  /**
   * Submits product data to backend (create or update based on productId)
   * Shows success message and optionally resets form for new products
   *
   * @param payload Product data to submit (includes image file path)
   */
  function submitProduct(payload: Product): void {
    const method = productId ? "update" : "create";

    $.ajax({
      url: `/itea/backend/serviceHandler.php?handler=products&method=${method}`,
      type: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify(payload),
      success: function (response: { name: string; error?: string }) {
        const action = productId ? "updated" : "created";
        const overviewLink = productId
          ? ` <a href="/itea/frontend/sites/admin/productOverview.html">Back to product overview</a>`
          : "";
        $("#upload-success")
          .html(
            `Product "${response.name}" ${action} successfully!${overviewLink}`,
          )
          .show();
        if (!productId) {
          ($("#product-upload-form")[0] as HTMLFormElement).reset();
          $("#description").css("height", "");
        }
      },
      error: showBackendError,
    });
  }

  /**
   * Parses backend error response and displays it
   *
   * @param xhr AJAX error response object
   */
  function showBackendError(xhr: JQuery.jqXHR): void {
    const res = JSON.parse(xhr.responseText);
    $("#database-error").text(res.error).show();
  }
});
