/**
 * Handles the admin product management page.
 * Loads products and categories, displays product data in a table,
 * and allows admins to delete products.
 */

interface AdminProductCategory {
  id: number;
  name: string;
}

$(function () {
  requireRole("admin", function () {
    loadAdminProducts();
  });

  $("#product-table-body").on("click", ".delete-product-btn", function () {
    const productId = Number($(this).data("id"));
    const productName = String($(this).data("name") ?? "");
    const row = $(this).closest("tr");

    deleteProduct(productId, productName, row);
  });

  /**
   * Loads product and category data for the admin product table.
   */
  function loadAdminProducts(): void {
    const categoriesRequest = $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=products&method=getCategories",
      type: "GET",
      dataType: "json",
    });

    const productsRequest = $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=products&method=getAll",
      type: "GET",
      dataType: "json",
    });

    $.when(categoriesRequest, productsRequest)
      .done(function (
        categoriesResult: [AdminProductCategory[]],
        productsResult: [Product[]],
      ) {
        const categories = categoriesResult[0];
        const products = productsResult[0];

        renderProductTable(categories, products);
      })
      .fail(function (xhr: JQuery.jqXHR) {
        showAdminProductError(getAdminProductBackendError(xhr));
      });
  }

  /**
   * Renders the product table with category names.
   *
   * @param categories Product categories
   * @param products Products to display
   */
  function renderProductTable(
    categories: AdminProductCategory[],
    products: Product[],
  ): void {
    const categoryMap = createCategoryMap(categories);
    const tableBody = $("#product-table-body");

    tableBody.empty();

    if (products.length === 0) {
      tableBody.append(createEmptyProductRow());
      return;
    }

    products.forEach(function (product: Product) {
      tableBody.append(createProductRow(product, categoryMap));
    });
  }

  /**
   * Creates a lookup map from category ID to category name.
   *
   * @param categories Product categories
   * @returns Category name map
   */
  function createCategoryMap(
    categories: AdminProductCategory[],
  ): Record<number, string> {
    const categoryMap: Record<number, string> = {};

    categories.forEach(function (category: AdminProductCategory) {
      categoryMap[category.id] = category.name;
    });

    return categoryMap;
  }

  /**
   * Creates one product table row from the product template.
   *
   * @param product Product data
   * @param categoryMap Category name lookup map
   * @returns Product table row
   */
  function createProductRow(
    product: Product,
    categoryMap: Record<number, string>,
  ): JQuery<HTMLElement> {
    const row = cloneAdminProductTemplate("product-row-template");
    const categoryName = categoryMap[product.categoryId] ?? "Unknown";
    const rating = product.rating ? product.rating.toFixed(2) : "—";

    row
      .find(".product-img")
      .attr("src", `/itea/backend/productpictures/${product.filePath ?? ""}`)
      .attr("alt", product.name);

    row.find(".product-name").text(product.name);
    row.find(".product-description").text(product.description);
    row.find(".product-price").text(formatAdminProductCurrency(product.price));
    row.find(".product-category").text(categoryName);
    row.find(".product-rating").text(rating);

    row
      .find(".product-edit-btn")
      .attr(
        "href",
        `/itea/frontend/sites/admin/productUpload.html?id=${product.id}`,
      );

    row.find(".delete-product-btn").data("id", product.id);
    row.find(".delete-product-btn").data("name", product.name);

    return row;
  }

  /**
   * Creates an empty table row for the no-products state.
   *
   * @returns Empty state table row
   */
  function createEmptyProductRow(): JQuery<HTMLElement> {
    return $("<tr>").append(
      $("<td>")
        .attr("colspan", "7")
        .addClass("text-center py-4")
        .text("No products found."),
    );
  }

  /**
   * Deletes a product after admin confirmation.
   *
   * @param productId Product identifier
   * @param productName Product name for confirmation text
   * @param row Product table row to remove after successful deletion
   */
  function deleteProduct(
    productId: number,
    productName: string,
    row: JQuery<HTMLElement>,
  ): void {
    if (!productId) {
      showAdminProductError("Missing product id.");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=products&method=delete",
      type: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({ id: productId }),

      success: function () {
        row.remove();
      },

      error: function (xhr: JQuery.jqXHR) {
        showAdminProductError(getAdminProductBackendError(xhr));
      },
    });
  }

  /**
   * Clones a template element by ID.
   *
   * @param templateId Template element ID
   * @returns Cloned template content
   */
  function cloneAdminProductTemplate(templateId: string): JQuery<HTMLElement> {
    const template = document.getElementById(
      templateId,
    ) as HTMLTemplateElement | null;

    if (!template || !template.content.firstElementChild) {
      return $();
    }

    return $(template.content.firstElementChild.cloneNode(true) as HTMLElement);
  }

  /**
   * Formats a numeric value as Euro currency.
   *
   * @param value Numeric value
   * @returns Formatted currency string
   */
  function formatAdminProductCurrency(value: number | string | null): string {
    return `€ ${Number(value ?? 0).toFixed(2)}`;
  }

  /**
   * Extracts a readable error message from an AJAX error response.
   *
   * @param xhr jQuery AJAX error response
   * @returns Error message
   */
  function getAdminProductBackendError(xhr: JQuery.jqXHR): string {
    const fallbackMessage = "An unexpected error occurred.";

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

  /**
   * Displays an admin product error message.
   *
   * @param message Error message
   */
  function showAdminProductError(message: string): void {
    alert(message);
  }
});