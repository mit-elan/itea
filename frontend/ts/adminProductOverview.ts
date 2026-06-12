$(function () {
  checkLoginStatus().then(function (response) {
    if (response.role !== "admin") {
      window.location.href = "/itea/frontend/index.html";
    }
  });

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

  $.when(categoriesRequest, productsRequest).done(function (
    categoriesResult: [{ id: number; name: string }[]],
    productsResult: [Product[]],
  ) {
    const categories = categoriesResult[0];
    const products = productsResult[0];

    const categoryMap: { [id: number]: string } = {};
    categories.forEach((cat) => (categoryMap[cat.id] = cat.name));

    const $tbody = $("#product-table-body");
    $tbody.empty();

    if (products.length === 0) {
      $tbody.append(
        '<tr><td colspan="7" class="text-center py-4">No products found.</td></tr>',
      );
      return;
    }

    const template = document.getElementById(
      "product-row-template",
    ) as HTMLTemplateElement;

    products.forEach((product) => {
      const categoryName = categoryMap[product.categoryId] ?? "Unknown";
      const rating = product.rating ? product.rating.toFixed(1) : "—";

      const $row = $(
        document.importNode(template.content, true)
          .firstElementChild as HTMLElement,
      );

      $row
        .find(".product-img")
        .attr("src", `/itea/backend/productpictures/${product.filePath ?? ""}`)
        .attr("alt", product.name);
      $row.find(".product-name").text(product.name);
      $row.find(".product-description").text(product.description);
      $row.find(".product-price").text(`€ ${Number(product.price).toFixed(2)}`);
      $row.find(".product-category").text(categoryName);
      $row.find(".product-rating").text(rating);
      $row
        .find(".product-edit-btn")
        .attr(
          "href",
          `/itea/frontend/sites/admin/productUpload.html?id=${product.id}`,
        );
      $row.find(".delete-product-btn").attr("data-id", String(product.id)).attr("data-name", product.name);

      $tbody.append($row);
    });
  });

  $("#product-table-body").on("click", ".delete-product-btn", function () {
    const name = $(this).attr("data-name");
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    const id = parseInt($(this).attr("data-id") as string);
    const $row = $(this).closest("tr");

    $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=products&method=delete",
      type: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({ id }),
      success: function () {
        $row.remove();
      },
      error: function (xhr) {
        const res = JSON.parse(xhr.responseText);
        alert(res.error);
      },
    });
  });
});
