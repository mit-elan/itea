/**
 * Handles the admin product upload and edit page.
 * The page creates a new product or edits an existing product based on the URL id parameter.
 */

interface AdminProductUploadCategory {
  id: number;
  name: string;
}

interface AdminProductUploadImageResponse {
  filePath: string;
}

interface AdminProductUploadSaveResponse {
  name?: string;
}

$(document).ready(function () {
  requireRole("admin", function () {
    initializeProductUploadPage();
  });

  function initializeProductUploadPage(): void {
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

  function loadCategories(
    productId: string | null,
    onLoaded: () => void,
  ): void {
    $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=products&method=getCategories",
      type: "GET",
      dataType: "json",

      success: function (categories: AdminProductUploadCategory[]) {
        const select = $("#category");
        select.empty();

        categories.forEach(function (category: AdminProductUploadCategory) {
          select.append($("<option>").val(category.id).text(category.name));
        });

        onLoaded();
      },

      error: function (xhr: JQuery.jqXHR) {
        showAdminProductUploadBackendError(xhr);
      },
    });
  }

  function loadProduct(productId: string): void {
    $("#upload-edit-title").text("Edit Product");
    $("#upload-edit-button").text("Save Changes");

    $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=products&method=getById",
      type: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({ id: Number(productId) }),

      success: function (product: Product) {
        $("#name").val(product.name);
        $("#description").val(product.description);
        $("#price").val(String(product.price));
        $("#rating").val(String(product.rating ?? ""));
        $("#category").val(String(product.categoryId));

        $("#product-upload-form").data(
          "existing-file-path",
          product.filePath ?? "",
        );
      },

      error: function (xhr: JQuery.jqXHR) {
        showAdminProductUploadBackendError(xhr);
      },
    });
  }

  function handleProductFormSubmit(
    productId: string | null,
    existingFilePath: string,
    updateExistingFilePath: (filePath: string) => void,
  ): void {
    hideProductUploadMessages();

    const validationResult = validateProductForm(productId);

    if (!validationResult.valid || !validationResult.product) {
      return;
    }

    const imageFile = getSelectedImageFile();

    if (imageFile) {
      uploadProductImage(imageFile, function (filePath: string) {
        if (!validationResult.product) {
          return;
        }

        const productPayload: Product = {
          ...validationResult.product,
          filePath: filePath,
        };

        updateExistingFilePath(filePath);
        submitProduct(productId, productPayload);
      });

      return;
    }

    const storedFilePath =
      String($("#product-upload-form").data("existing-file-path") ?? "") ||
      existingFilePath;

    submitProduct(productId, {
      ...validationResult.product,
      filePath: storedFilePath,
    });
  }

  function validateProductForm(productId: string | null): {
    valid: boolean;
    product?: Product;
  } {
    let hasError = false;

    const rating = Number.parseFloat(
      getAdminProductUploadInputValue("#rating"),
    );
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

    const product: Product = {
      id: productId ? Number.parseInt(productId, 10) : 0,
      categoryId: Number.parseInt(
        getAdminProductUploadInputValue("#category"),
        10,
      ),
      name: getAdminProductUploadInputValue("#name").trim(),
      description: getAdminProductUploadInputValue("#description").trim(),
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

    if (hasError) {
      return { valid: false };
    }

    return {
      valid: true,
      product: product,
    };
  }

  function uploadProductImage(
    imageFile: File,
    onSuccess: (filePath: string) => void,
  ): void {
    const formData = new FormData();
    formData.append("image", imageFile);

    $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=products&method=uploadImage",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      dataType: "json",

      success: function (response: AdminProductUploadImageResponse) {
        onSuccess(response.filePath);
      },

      error: function (xhr: JQuery.jqXHR) {
        showAdminProductUploadBackendError(xhr);
      },
    });
  }

  function submitProduct(productId: string | null, payload: Product): void {
    const method = productId ? "update" : "create";

    $.ajax({
      url: `/itea/backend/serviceHandler.php?handler=products&method=${method}`,
      type: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify(payload),

      success: function (response: AdminProductUploadSaveResponse) {
        const action = productId ? "updated" : "created";
        const productName = response.name ?? payload.name;
        const overviewLink = productId
          ? ` <a href="/itea/frontend/sites/admin/manageProducts.html">Back to product overview</a>`
          : "";

        $("#upload-success")
          .html(
            `Product "${productName}" ${action} successfully!${overviewLink}`,
          )
          .show();

        if (!productId) {
          ($("#product-upload-form")[0] as HTMLFormElement).reset();
          $("#description").css("height", "");
          $("#product-upload-form").removeData("existing-file-path");
        }
      },

      error: function (xhr: JQuery.jqXHR) {
        showAdminProductUploadBackendError(xhr);
      },
    });
  }

  function getSelectedImageFile(): File | undefined {
    return ($("#product-image")[0] as HTMLInputElement).files?.[0];
  }

  function getAdminProductUploadInputValue(selector: string): string {
    const value = $(selector).val();

    return typeof value === "string" ? value : "";
  }

  function hideProductUploadMessages(): void {
    $("#field-error, #rating-error, #price-error, #database-error")
      .stop(true, true)
      .hide()
      .text("");
  }

  function showAdminProductUploadBackendError(xhr: JQuery.jqXHR): void {
    let errorMessage = "An unexpected error occurred.";

    if (xhr.responseText) {
      try {
        const response = JSON.parse(xhr.responseText) as ApiErrorResponse;
        errorMessage = response.error ?? errorMessage;
      } catch {
        errorMessage = errorMessage;
      }
    }

    $("#database-error").text(errorMessage).show();
  }
});
