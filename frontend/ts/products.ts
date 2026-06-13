const CATEGORY_ID_TO_NAME: { [key: number]: string } = {
  1: "black",
  2: "green",
  3: "fruit",
  4: "herbal",
};

// Flag to prevent the stop event from hiding the zone when a drop just occurred.
let dropOccurred = false;

$(document).ready(function () {
  setupFilterLogic();
  checkLoginStatus().then(function (response) {
    updateNavigation(response);
    loadProducts();
  });

  // Continuous search filter
  $("#search-input").on("input", function () {
    $(".category-chip.active").removeClass("active");
    $("#button-all").addClass("active");
    const searchTerm = ($(this).val() as string).toLowerCase().trim();
    $("#product-list .product-item").each(function () {
      const title = $(this).find(".tea-card-title").text().toLowerCase();
      $(this).toggle(title.includes(searchTerm));
    });
  });

  function loadProducts(): void {
    $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=products&method=getAll",
      method: "GET",
      dataType: "json",
      success: function (data: Product[]) {
        $("#no-products").hide();
        if (!data || data.length === 0) {
          $("#product-list").empty();
          $("#no-products").show();
          return;
        }
        renderProducts(data);
        initDragDrop();
      },
      error: function (err) {
        console.error("Error loading products: ", err);
        $("#no-products").show();
      },
    });
  }

  function renderProducts(products: Product[]): void {
    const $container = $("#product-list");
    $container.empty();
    const template = document.getElementById(
      "product-card-template",
    ) as HTMLTemplateElement;

    products.forEach((product) => {
      if (!product.id || !product.name || !product.price) return;

      const categoryName = CATEGORY_ID_TO_NAME[product.categoryId];
      const stars = "★".repeat(Math.floor(product.rating || 0)).padEnd(5, "☆");
      const reviewText =
        typeof product.rating === "number" && product.rating > 0
          ? product.rating + " Star-Rating"
          : "(0 reviews)";

      const $card = $(
        document.importNode(template.content, true)
          .firstElementChild as HTMLElement,
      );
      $card.attr("data-category", categoryName);
      $card
        .find(".product-link")
        .attr("href", `productInfo.html?id=${product.id}`);
      $card
        .find(".tea-card-image")
        .attr("src", `/itea/backend/productpictures/${product.filePath}`)
        .attr("alt", product.name);
      $card.find(".tea-card-title").text(product.name);
      $card.find(".tea-card-description").text(product.description);
      $card.find(".stars").text(stars);
      $card.find(".review-text").text(reviewText);
      $card
        .find(".tea-card-price")
        .text(`€${Number(product.price).toFixed(2)}`);
      $card.find(".button-addToCartList").attr("data-id", String(product.id));
      $container.append($card);
    });
  }

  function initDragDrop(): void {
    // Drag a card by its handle. A small custom helper follows the cursor.
    // When drag starts, show the fixed dropzone below the header.
    $(".product-item").draggable({
      handle: ".drag-handle",
      helper: function (this: HTMLElement) {
        const name = $(this).find(".tea-card-title").text();
        return $(
          `<div class="drag-helper"><i class="bi bi-bag-plus"></i> ${name}</div>`,
        );
      },
      cursorAt: { top: 18, left: 18 },
      revert: "invalid",
      zIndex: 9999,
      start: function () {
        dropOccurred = false; // Reset the flag on each new drag start
        const $zone = $("#drag-drop-zone-fixed");
        $zone.addClass("active").fadeIn(200);
      },
      stop: function () {
        const $zone = $("#drag-drop-zone-fixed");
        // Only hide the zone if no drop just occurred.
        // If a drop occurred, showDropConfirmation() will handle hiding after error/success message fades.
        if (!dropOccurred && $zone.hasClass("active")) {
          $zone.fadeOut(200, function () {
            $zone.removeClass("active");
          });
        }
      },
    });

    $("#drag-drop-zone-fixed").droppable({
      accept: ".product-item",
      tolerance: "pointer",
      hoverClass: "drop-zone-hover",
      drop: function (_event: JQuery.Event, ui: IteaDroppableUi) {
        dropOccurred = true; // Set flag so stop() won't hide the zone
        const productId = ui.draggable.find(".button-addToCartList").data("id");
        if (productId) {
          window.addToCartViaDrag(
            Number(productId),
            showDropConfirmation,
            showDropError,
          );
        }
      },
    });
  }

  // Show a message (success or error) in the drop zone instead of the default, then hide everything.
  // $zone = Container (on/off), $message = Content inside Container
  function showDropMessage($message: JQuery): void {
    const $default = $(".drag-drop-zone-default");
    const $zone = $("#drag-drop-zone-fixed"); // The outer container

    $default.hide();
    $message.fadeIn(200).delay(2000).fadeOut(300);

    $zone.delay(2000).fadeOut(300, function () {
      $zone.removeClass("active");
      $default.show();
      dropOccurred = false;
    });
  }

  function showDropConfirmation(): void {
    showDropMessage($(".drag-drop-zone-success"));
  }

  function showDropError(): void {
    showDropMessage($(".drag-drop-zone-error"));
  }

  function setupFilterLogic(): void {
    $(".category-chip").on("click", function () {
      $(".category-chip").removeClass("active");
      $(this).addClass("active");
      const filterValue = $(this).attr("data-category");

      if (filterValue === "all") {
        $(".product-item").show();
      } else {
        $(".product-item").hide();
        $(`.product-item[data-category="${filterValue}"]`).show();
      }

      const visibleCards = $(".product-item:visible").length;
      $("#no-products").toggle(visibleCards === 0);
    });
  }
});
