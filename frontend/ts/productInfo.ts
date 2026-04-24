const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  file_path: string;
  rating?: number;
}

$(document).ready(function () {
  $("#no-tea-found").hide();
  // 1. Daten laden
  if (productId) {
    loadProduct();
  } else {
    $("#product-details").hide();
    $("#no-tea-found").show();
    return;
  }

  function loadProduct() {
    $.ajax({
      url:
        "/itea/backend/serviceHandler.php?handler=products&method=getById&id=" +
        productId,
      method: "GET",
      dataType: "json", // Stellt sicher, dass jQuery das JSON automatisch parst
      success: function (data: Product) {
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

  function renderProduct(product: Product) {
    $("#product-image img")
      .attr("src", "/iTEA/backend/productpictures/" + product.file_path)
      .attr("alt", product.name);
    $("#product-title").text(product.name);
    $("#product-description").text(product.description);

    // Sicherstellen, dass price eine Zahl ist, bevor toFixed genutzt wird
    const price =
      typeof product.price === "string"
        ? parseFloat(product.price)
        : product.price;
    $("#product-price").text(`€ ${price.toFixed(2)} | 100g`);
  }

  // 2. Quantity Logik
  $("#button-minus").on("click", function () {
    let currentValue = parseInt($("#quantity-input").val() as string) || 1;
    if (currentValue > 1) {
      currentValue--;
      $("#quantity-input").val(currentValue);
    }
  });

  $("#button-plus").on("click", function () {
    let currentValue = parseInt($("#quantity-input").val() as string) || 1;
    currentValue++;
    $("#quantity-input").val(currentValue);
  });
});
